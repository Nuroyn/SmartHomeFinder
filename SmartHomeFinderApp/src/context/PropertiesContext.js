// context/PropertiesContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PropertiesContext = createContext();

const LS_PROPERTIES_KEY = "app_properties_v1";
const LS_IMG_CARD_KEY = "app_img_cards_v1";

// Initial properties data
const initialData = [
  {
    id: 1,
    title: "Bungalow",
    description: "A beautiful Bungalow in the city center.",
    imageUrl:
      "https://media.istockphoto.com/id/182151077/photo/row-of-residential-mobile-park-home.webp?a=1&b=1&s=612x612&w=0&k=20&c=uFm-zEtVDbfJuQC5byk-Xc4t6qh0c04GyIcnM_z7DbQ=",
    price: "N7,000,000/Annum",
    location: "Jahi, Abuja",
    propertyType: "Bungalow",
    yearBuilt: "2018",
    bedrooms: "3",
    bathrooms: "3",
    images: [
      "https://media.istockphoto.com/id/182151077/photo/row-of-residential-mobile-park-home.webp?a=1&b=1&s=612x612&w=0&k=20&c=uFm-zEtVDbfJuQC5byk-Xc4t6qh0c04GyIcnM_z7DbQ=",
    ],
  },
];

// Initial ImgCardList data
const initialImgCardList = [
  {
    id: 1,
    title: "Recommended for you",
    bage: "12",
    imageUrl:
      "https://images.unsplash.com/photo-1594348352429-159508d48c57?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "New Listings",
    bage: "8",
    imageUrl:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Open House",
    bage: "5",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1661930527039-f809e14b8102?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "New Constructions",
    bage: "7",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1747679550439-2f2a3bf49803?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1760",
  },
  {
    id: 5,
    title: "Land",
    bage: "4",
    imageUrl:
      "https://media.istockphoto.com/id/1437629749/photo/land-plot-in-aerial-view-in-chiang-mai-of-thailand.jpg?s=1024x1024&w=is&k=20&c=TR0rQWNanRL5V_le7WFLxbBfjp5o71YCac0C6l_xVLU=",
  },
  {
    id: 6,
    title: "Reduced Price",
    bage: "9",
    imageUrl:
      "https://images.unsplash.com/photo-1681181752946-a23449988fba?w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Luxury Homes",
    bage: "6",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Apartments",
    bage: "11",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1680281937008-f9b19ed9afb6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1613",
  },
];

export function PropertiesProvider({ children }) {
  // properties list
  const [properties, setProperties] = useState(() => {
    try {
      const fromLS = localStorage.getItem(LS_PROPERTIES_KEY);
      return fromLS ? JSON.parse(fromLS) : initialData;
    } catch {
      return initialData;
    }
  });

  // img card list
  const [imgCardList, setImgCardList] = useState(() => {
    try {
      const fromLS = localStorage.getItem(LS_IMG_CARD_KEY);
      return fromLS ? JSON.parse(fromLS) : initialImgCardList;
    } catch {
      return initialImgCardList;
    }
  });

  // persist properties
  useEffect(() => {
    localStorage.setItem(LS_PROPERTIES_KEY, JSON.stringify(properties));
  }, [properties]);

  // persist imgCardList
  useEffect(() => {
    localStorage.setItem(LS_IMG_CARD_KEY, JSON.stringify(imgCardList));
  }, [imgCardList]);

  const addProperty = (payload) => {
    setProperties((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
      return [...prev, { id: nextId, ...payload }];
    });
  };

  const addImgCard = (payload) => {
    setImgCardList((prev) => {
      const nextId = prev.length
        ? Math.max(...prev.map((card) => card.id)) + 1
        : 1;
      return [...prev, { id: nextId, ...payload }];
    });
  };

  const value = useMemo(
    () => ({
      properties,
      addProperty,
      imgCardList,
      addImgCard,
    }),
    [properties, imgCardList]
  );

  return (
    <PropertiesContext.Provider value={value}>
      {children}
    </PropertiesContext.Provider>
  );
}

export const useProperties = () => useContext(PropertiesContext);
