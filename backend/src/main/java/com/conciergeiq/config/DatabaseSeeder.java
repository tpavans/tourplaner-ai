package com.conciergeiq.config;

import com.conciergeiq.entity.*;
import com.conciergeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PreferenceProfileRepository preferenceProfileRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // DB already seeded
        }

        // 1. Seed Users
        User guest = User.builder()
                .email("guest@example.com")
                .password(passwordEncoder.encode("password"))
                .fullName("Anusri Kommana")
                .phone("+91 98765 43210")
                .role(Role.GUEST)
                .build();

        User staff = User.builder()
                .email("staff@example.com")
                .password(passwordEncoder.encode("password"))
                .fullName("Hotel Manager")
                .phone("+91 99999 88888")
                .role(Role.STAFF)
                .build();

        User admin = User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("password"))
                .fullName("System Admin")
                .phone("+1 555 0199")
                .role(Role.ADMIN)
                .build();

        userRepository.saveAll(Arrays.asList(guest, staff, admin));

        // 2. Preference Profile for Guest
        PreferenceProfile profile = PreferenceProfile.builder()
                .user(guest)
                .interests(new ArrayList<>(Arrays.asList("BEACHES", "WATER_SPORTS", "CULTURAL_SIGHTS")))
                .foodPreferences(new ArrayList<>(Arrays.asList("SEAFOOD", "VEGETARIAN")))
                .accommodationPreferences(new ArrayList<>(Arrays.asList("LUXURY", "BEACHFRONT")))
                .budgetTier("HIGH")
                .mobilityLevel("STANDARD")
                .build();
        preferenceProfileRepository.save(profile);

        // 3. Seed Hotels
        Hotel luxuryHotel = Hotel.builder()
                .name("The Sea View Resort")
                .description("A high-end, 5-star beachfront paradise overlooking the azure Arabian Sea.")
                .address("Vagator Beach Road")
                .city("Goa")
                .rating(4.9)
                .contactNumber("+91 832 227 0001")
                .imageUrls(List.of("https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"))
                .latitude(15.5992)
                .longitude(73.7431)
                .build();

        Hotel boutiqueHotel = Hotel.builder()
                .name("Heritage Boutique Villa")
                .description("Restored Portuguese mansion offering luxury vintage suites and private garden views.")
                .address("Fontainhas Latin Quarter")
                .city("Goa")
                .rating(4.7)
                .contactNumber("+91 832 242 0002")
                .imageUrls(List.of("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"))
                .latitude(15.4989)
                .longitude(73.8278)
                .build();

        hotelRepository.saveAll(Arrays.asList(luxuryHotel, boutiqueHotel));

        // 4. Seed Rooms
        Room r1 = Room.builder().hotel(luxuryHotel).roomType("Ocean View Deluxe").pricePerNight(new BigDecimal("250.00")).capacity(2).isAvailable(true).build();
        Room r2 = Room.builder().hotel(luxuryHotel).roomType("Presidential Suite").pricePerNight(new BigDecimal("500.00")).capacity(4).isAvailable(true).build();
        Room r3 = Room.builder().hotel(boutiqueHotel).roomType("Heritage Garden Suite").pricePerNight(new BigDecimal("150.00")).capacity(2).isAvailable(true).build();

        roomRepository.saveAll(Arrays.asList(r1, r2, r3));

        // 5. Seed Restaurants
        Restaurant rest1 = Restaurant.builder()
                .name("Seaside Grill Restaurant")
                .cuisineType("Mediterranean")
                .averagePrice(new BigDecimal("40.00"))
                .address("Baga Beach Cliffside")
                .city("Goa")
                .rating(4.8)
                .contactNumber("+91 832 333 4444")
                .imageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80")
                .latitude(15.5562)
                .longitude(73.7512)
                .build();

        Restaurant rest2 = Restaurant.builder()
                .name("Fisherman's Wharf")
                .cuisineType("Seafood")
                .averagePrice(new BigDecimal("30.00"))
                .address("Panaji Riverside")
                .city("Goa")
                .rating(4.6)
                .contactNumber("+91 832 555 6666")
                .imageUrl("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80")
                .latitude(15.4909)
                .longitude(73.8122)
                .build();

        restaurantRepository.saveAll(Arrays.asList(rest1, rest2));

        // 6. Seed Events
        Event event1 = Event.builder()
                .name("Goa Food Festival")
                .description("An immersive celebration of traditional Goan spices, seafood curries, and modern culinary fusion.")
                .category("FOOD")
                .dateTime(OffsetDateTime.now().plusDays(2))
                .location("Baga Ground")
                .address("Near Baga Bridge")
                .city("Goa")
                .price(new BigDecimal("15.00"))
                .capacity(1000)
                .imageUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80")
                .latitude(15.5540)
                .longitude(73.7562)
                .build();

        Event event2 = Event.builder()
                .name("Live Music Night")
                .description("Chill acoustic covers and lively jazz sets beside the ocean shore.")
                .category("MUSIC")
                .dateTime(OffsetDateTime.now().plusDays(3))
                .location("Tito's Lane Beachfront")
                .address("Calangute Shoreline")
                .city("Goa")
                .price(new BigDecimal("25.00"))
                .capacity(300)
                .imageUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80")
                .latitude(15.5450)
                .longitude(73.7540)
                .build();

        eventRepository.saveAll(Arrays.asList(event1, event2));
    }
}
