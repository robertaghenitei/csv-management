from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, permissions, response, status
from django.shortcuts import get_object_or_404
import requests
from .serializers import SesizareSerializer, UserSerializer, ObservatieSerializer, RegionSerializer, AddressSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .models import Sesizare, Observatie, Region, Address
# Create your views here.
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.exceptions import NotFound

from django.http import JsonResponse



class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class InchideSesizareView(generics.RetrieveUpdateAPIView):
    queryset = Sesizare.objects.all()
    serializer_class = SesizareSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "id"
    def perform_update(self, serializer):
        # Check if `cine_inchide_defectiunea` is explicitly set to `null`
        cine_inchide_defectiunea = self.request.data.get("cine_inchide_defectiunea", None)
        print("Request Data: ", self.request.data)
        if cine_inchide_defectiunea in [None, "", "null"]:
            serializer.save(cine_inchide_defectiunea=None)  # Allow setting null
        else:
            serializer.save(cine_inchide_defectiunea=self.request.user) 

class SesizareListCreate(generics.ListCreateAPIView):
    serializer_class = SesizareSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        sector = self.request.query_params.get("sector", None)
        queryset = Sesizare.objects.all().order_by("-data_emiterii")  # Reverse order by date
        
        if sector:
            queryset = queryset.filter(sector__iexact=sector)  # Filter by sector
        
        return queryset

    def list(self, request, *args, **kwargs):
        # If ?all=true is in query params, return all results without pagination
        if request.query_params.get("all") == "true":
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        # Otherwise, use default pagination
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class ObservatieListCreate(generics.ListCreateAPIView):
    serializer_class = ObservatieSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        sesizare_id = self.kwargs["sesizare_id"]
        sesizare = Sesizare.objects.get(pk=sesizare_id)
        return Observatie.objects.filter(sesizare=sesizare)
    
    def perform_create(self, serializer):
        sesizare_id = self.kwargs["sesizare_id"]
        sesizare = Sesizare.objects.get(pk=sesizare_id)
        
        if serializer.is_valid():
            serializer.save(sesizare=sesizare)
        else:
            print("serializer.errors")

class RegionListView(ListAPIView):
    queryset = Region.objects.all().order_by("name")
    serializer_class = RegionSerializer

class AddressListView(APIView):
    def get(self, request):
        search_query = request.GET.get("search", "").strip()
        sector = request.GET.get("sector", "").strip()

        if not search_query:
            return Response([])

        addresses = Address.objects.filter(Q(name__icontains=search_query)).select_related("region")

        if sector == "1 Iftime":
            allowed_region_ids = [
                1, 6, 7, 8, 9, 10, 11, 12, 16, 20,
                24, 27, 28, 29, 34, 35, 36, 37
            ]
        elif sector == "2 Scutaru":
            all_region_ids = set(range(1, 38))
            iftime_region_ids = {
                1, 6, 7, 8, 9, 10, 11, 12, 16, 20,
                24, 27, 28, 29, 34, 35, 36, 37
            }
            allowed_region_ids = list(all_region_ids - iftime_region_ids)
        else:
            allowed_region_ids = []  # Invalid or no sector given

        # Filter by both search and region access
        addresses = Address.objects.filter(
            Q(name__icontains=search_query),
            region__id__in=allowed_region_ids
        ).select_related("region")

        return Response([
            {
                "id": addr.id,
                "name": addr.name,
                "region_id": addr.region.id,
                "region_name": addr.region.name
            }
            for addr in addresses
        ])



class SesizariAdresa(generics.ListAPIView):
    serializer_class = SesizareSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        adresa = self.kwargs['adresa']  # Extrage parametrul din URL
        queryset = Sesizare.objects.filter(adresa=adresa)
        if not queryset.exists():
            raise NotFound(detail="Adresa nu există.")
        return queryset


def vremea(request):
    appid="6620adbdca1f561b30ab5e6c8c754a78"
    URL = "http://api.openweathermap.org/data/2.5/weather"
    PARAMS = {"q": "Botosani", "appid": appid, "units": "metric", "lang": "RO"}
    try:
        response = requests.get(url=URL, params=PARAMS)   
        #On successful response, we'll get a status code of 200, so comparing
        # if the request was successful. 
        if response.status_code == 200:
            print("Request was Successful")
            data = response.json()
            return JsonResponse(data)
        else:
            print("Request was not Successful")
            return JsonResponse({"error": "Eroare la preluarea datelor meteo"}, status=response.status_code)
 #Handling any exceptions that may occur
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        print("Request was not Successful")
        return JsonResponse({"error": str(e)}, status=500)


