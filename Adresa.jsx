import { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import api from "../api";

function Adresa({ setAdresa, setPunct_termic, adresa, sector }) {
  const [addresses, setAddresses] = useState([]); // Address suggestions
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch matching addresses based on user input
  const fetchAddresses = useCallback((query) => {
    if (!query.trim()) {
      setAddresses([]);
      return;
    }

    setIsLoading(true);

    api.get(`/api/addresses?search=${query}&sector=${sector}`) // adaugam la cautare si sectorul pentru a alege doar adresele si punctele termice de pe sectorul respectiv
      .then(res => res.data)
      .then(data => setAddresses(data.map(address => ({
        value: address.id,
        label: address.name,
        region: { id: address.region_id, name: address.region_name }
      }))))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sector]);

  useEffect(() => {
    const handler = setTimeout(() => fetchAddresses(searchQuery), 300); // Debounce API calls
    return () => clearTimeout(handler);
  }, [searchQuery, fetchAddresses]);

  // Reset select and address state when adresa is cleared
  useEffect(() => {
    if (!adresa) {
      setSelectedAddress(null); // Reset address selection
      setSelectedRegion(null);   // Reset region selection
    }
  }, [adresa]); // Re-run when adresa state is updated

  return (
    <div className="flex flex-col gap-4 w-64">
      <label htmlFor="adresa">Adresa</label>
      <Select
        id="adresa"
        options={addresses}
        placeholder="Cauta Adresa"
        isLoading={isLoading}
        noOptionsMessage={() => "No addresses found"}
        onInputChange={(inputValue, { action }) => {
          if (action === "input-change") setSearchQuery(inputValue);
        }}
        onChange={(selected) => {
          setSelectedAddress(selected);
          setSelectedRegion(selected?.region || null);
          setAdresa(selected?.label || ""); // Pass selected address to parent
          setPunct_termic(selected?.region?.name || ""); // Set punct_termic
        }}
        value={selectedAddress || null} // Ensures the Select component is controlled and resets on clear
        isClearable
      />

      <label htmlFor="punct_termic">Punct Termic</label>
      <Select
        id="punct_termic"
        value={selectedRegion ? { value: selectedRegion.id, label: selectedRegion.name } : null}
        placeholder="Punct Termic"
        isDisabled={!selectedRegion}
      />
    </div>
  );
}

export default Adresa;
