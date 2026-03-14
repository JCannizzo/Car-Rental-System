from dataclasses import dataclass
from typing import Optional

@dataclass
class VehicleCard:
    # Basic Info
    make: str
    model: str
    year: int
    category: str

    price_per_day: float
    is_available: bool = True
    
    transmission: str = "Automatic"
    fuel_type: str = "Gasoline"
    image_url: Optional[str] = None

    def vehicle_card(self):
        """Prints a simple text-based card for the console."""
        status = "Available" if self.is_available else "Rented"
        
        card = f"""
        
         {self.year} {self.make} {self.model}
         Category: {self.category}
        
         Rate: ${self.price_per_day:.2f}/day
         Type: {self.transmission} | {self.fuel_type}
         Status: {status}
        
        """
        print(card)

if __name__ == "__main__":
    my_car = VehicleCard(
        make="Tesla",
        model="Model 3",
        year=2024,
        category="Electric",
        price_per_day=89.00,
        fuel_type="Electric"
    )

    my_car.vehicle_card()