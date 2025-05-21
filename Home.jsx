import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useSearchParams } from "react-router-dom"; // Import necessary hooks
import "../styles/Home.css";
import Sesizare from "../components/Sesizare";
import Weather from "../components/Weather";
import Adresa from "../components/Adresa";

import { Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Get query params
  
  const displaySector = searchParams.get("displaySector") || "1 Iftime"; // Default to "1 Iftime" if not provided

  const [sesizari, setSesizari] = useState([]);
  const [sector, setSector] = useState(displaySector);
  const [emitent, setEmitent] = useState("");
  const [comunicat_la, setComunicat_la] = useState("Maistru");
  const [punct_termic, setPunct_termic] = useState("Armonia");
  const [adresa, setAdresa] = useState("");
  const [acm_inc, setAcm_inc] = useState("INC");
  const [localizare, setLocalizare] = useState("Subsol");
  const [distributie_transport, setDistributie_transport] =
    useState("Distributie");
  const [scara_inchisa, setScara_inchisa] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSesizari(currentPage);
  }, [currentPage, displaySector]); // Fetch when sector or page changes

  const getSesizari = (page) => {
    setLoading(true);
    api
      .get(`/api/sesizari/?page=${page}&sector=${displaySector}`)
      .then((res) => res.data)
      .then((data) => {
        setSesizari(data.results);
        setTotalPages(data.results.length > 0 ? Math.ceil(data.count / 10) : 1);
      })
      .catch((error) => alert(error))
      .finally(() => {
        setLoading(false);
      });
  };

  const createSesizare = (e) => {
    e.preventDefault();
    api
      .post("/api/sesizari/", {
        sector,
        emitent,
        comunicat_la,
        punct_termic,
        adresa,
        acm_inc,
        localizare,
        distributie_transport,
        scara_inchisa,
      })
      .then((res) => {
        if (res.status === 201) {
          alert("Sesizarea a fost creata!");
          resetForm(); // Reset the form fields after submission
        } else {
          alert("Sesizarea nu a putut fi creata!");
        }
        getSesizari(1); // Refresh the sesizari list after creating one
      })
      .catch((error) => console.log(error));
  };

  const resetForm = () => {
    setSector("1 Iftime");
    setEmitent("");
    setComunicat_la("Maistru");
    setPunct_termic("Armonia");
    setAdresa("");
    setAcm_inc("INC");
    setLocalizare("Subsol");
    setDistributie_transport("Distributie");
    setScara_inchisa(true);
  };

  const pagesToDisplay = [];
  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) {
      pagesToDisplay.push(i);
    }
  } else {
    const pageStart = Math.max(1, currentPage - 1);
    const pageEnd = Math.min(totalPages, currentPage + 1);

    for (let i = pageStart; i <= pageEnd; i++) {
      if (i >= 1 && i <= totalPages) {
        pagesToDisplay.push(i);
      }
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSectorChange = (newSector) => {
    navigate(`?displaySector=${newSector}`);
    setSector(newSector); // Update sector state
  };

  return (
    <div className="dispecerat">
      <div className="vremea">
        {/* <Weather /> */}
      </div>
      <br />
      <h2>Adauga o sesizare</h2>
      <form onSubmit={createSesizare}>
        <label htmlFor="sector">Sector</label>
        <select
          id="sector"
          name="sector"
          onChange={(e) => setSector(e.target.value)}
          value={sector}
        >
          <option>1 Iftime</option>
          <option>2 Scutaru</option>
        </select>
        <br />
        <label htmlFor="emitent">Cine sesizeaza</label>
        <input
          type="text"
          id="emitent"
          name="emitent"
          required
          onChange={(e) => setEmitent(e.target.value)}
          value={emitent}
        ></input>
        <br />
        <label htmlFor="comunicat_la">Comunicat_la</label>
        <select
          id="comunicat_la"
          name="comunicat_la"
          onChange={(e) => setComunicat_la(e.target.value)}
          value={comunicat_la}
        >
          <option>Maistru</option>
          <option>Sef Formatie</option>
          <option>Sef Sectie</option>
        </select>
        <br />
        <Adresa setAdresa={setAdresa} setPunct_termic={setPunct_termic} adresa={adresa} sector={sector}/>
        <br />
        <label htmlFor="acm_inc">ACM sau INC</label>
        <select
          id="acm_inc"
          name="acm_inc"
          onChange={(e) => setAcm_inc(e.target.value)}
          value={acm_inc}
        >
          <option>INC</option>
          <option>ACM</option>
        </select>
        <br />
        <label htmlFor="localizare">Localizare</label>
        <select
          id="localizare"
          name="localizare"
          onChange={(e) => setLocalizare(e.target.value)}
          value={localizare}
        >
          <option>In afara blocului</option>
          <option>Subsol</option>
          <option>Casa_Scarii</option>
          <option>Apartament</option>
        </select>
        <br />
        <label htmlFor="distributie_transport">Distributie sau Transport</label>
        <select
          id="distributie_transport"
          name="distributie_transport"
          onChange={(e) => setDistributie_transport(e.target.value)}
          value={distributie_transport}
        >
          <option>Distributie</option>
          <option>Transport</option>
        </select>
        <br />
        <label htmlFor="scara_inchisa">Scara Inchisa</label>
        <select
          id="scara_inchisa"
          name="scara_inchisa"
          onChange={(e) =>
            setScara_inchisa(e.target.value === "DA" ? true : false)
          }
          value={scara_inchisa}
        >
          <option>DA</option>
          <option>Nu</option>
        </select>
        <br />
        <input type="submit" value="Submit"></input>
      </form>
      <br></br>
      <h1>Utilizatorul logat e {localStorage.getItem("user")}</h1>
      <br></br>

      <Link to="/select-adresa" className="select-adresa-link">
        Cauta toate sesizarile de la o adresa
      </Link>
      <br></br>
      <div className="sector-links-container">
        <div className="sector-links">
          <h3>Selectează sectorul:</h3>

          <br></br>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleSectorChange("1 Iftime");
            }}
            className={sector === "1 Iftime" ? "active" : ""}
          >
            Sector 1 Iftime
          </a>
          {" | "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleSectorChange("2 Scutaru");
            }}
            className={sector === "2 Scutaru" ? "active" : ""}
          >
            Sector 2 Scutaru
          </a>
        </div>
      </div>
      <br></br>

      <div>
        <h2>Sesizari</h2>
        <div className="divTable blueTable">
          <div className="divTableHeading">
            <div className="divTableRow">
              <div className="divTableHead">Nr.</div>
              <div className="divTableHead">Sector</div>
              <div className="divTableHead">Cine anunta</div>
              <div className="divTableHead">Data</div>
              <div className="divTableHead">Dispecer</div>
              <div className="divTableHead">Comunicat La</div>
              <div className="divTableHead">Punct Termic</div>
              <div className="divTableHead">Adresa</div>
              <div className="divTableHead">Serviciul</div>
              <div className="divTableHead">Localizare</div>
              <div className="divTableHead">Dist/Trans</div>
              <div className="divTableHead">Scara Inchisa?</div>
              <div className="divTableHead">Observatii</div>
              <div className="divTableHead">Remediat</div>
              <div className="divTableHead">Cine a inchis</div>
            </div>
          </div>
          <div className="divTableBody">
            {sesizari.map((sesizare) => (
              <Sesizare sesizare={sesizare} key={sesizare.id} />
            ))}
          </div>
        </div>
        <div className="blueTable outerTableFooter">
          <div className="tableFootStyle">
            <div className="links">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
              >
                &laquo;
              </a>
              {pagesToDisplay.map((page) => (
                <React.Fragment key={page}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    className={currentPage === page ? "active" : ""}
                  >
                    {page}
                  </a>
                </React.Fragment>
              ))}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
              >
                &raquo;
              </a>
            </div>
          </div>
        </div>
      </div>
      <div>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>


    </div>
  );
}

export default Home;
