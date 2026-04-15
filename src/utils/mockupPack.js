import {
  defaultMockupImg as defaultTshirtMockupImg,
  mockupList as tshirtMockupList,
} from "../data/mockups";
import { defaultHoodieMockupImg, hoodieMockupList } from "../data/mockupsHoodie";
import { defaultSweatshirtMockupImg, sweatshirtMockupList } from "../data/mockupsSweatshirt";
import { defaultLongSleeveMockupImg, longSleeveMockupList } from "../data/mockupsLongSleeve";
import { defaultTankTopMockupImg, tankTopMockupList } from "../data/mockupsTankTop";
import { defaultKidTshirtMockupImg, kidTshirtMockupList } from "../data/mockupsKidTshirt";
import { defaultKidHoodieMockupImg, kidHoodieMockupList } from "../data/mockupsKidHoodie";
import { defaultKidSweatshirtMockupImg, kidSweatshirtMockupList } from "../data/mockupsKidSweatshirt";
import { defaultBabyYbMockupImg, babyYbMockupList } from "../data/mockupsBabyYB";

import { defaultDrinkMugMockupImg, drinkMugMockupList } from "../data/mockupsDrinkMug";
import { defaultDrinkBottleMockupImg, drinkBottleMockupList } from "../data/mockupsDrinkBottles";
import { defaultDrinkTumblerMockupImg, drinkTumblerMockupList } from "../data/mockupsDrinkTumbler";
import { defaultDrinkGlassMockupImg, drinkGlassMockupList } from "../data/mockupsDrinkGlass";

import { defaultWallartPosterMockupImg, wallartPosterMockupList } from "../data/mockupsWallartPoster";
import { defaultWallartCanvasMockupImg, wallartCanvasMockupList } from "../data/mockupsWallartCanvases";

import { defaultHomewareCushionMockupImg, homewareCushionMockupList } from "../data/mockupsHomewareCushion";
import { defaultHomewareMatsMockupImg, homewareMatsMockupList } from "../data/mockupsHomewareMats";
import { defaultHomewareBlanketsMockupImg, homewareBlanketsMockupList } from "../data/mockupsHomewareBlankets";
import { defaultHomewareOrnamentMockupImg, homewareOrnamentMockupList } from "../data/mockupsHomewareOrnaments";
import { defaultHomewareYardSignMockupImg, homewareYardSignMockupList } from "../data/mockupsHomewareYardSign";
import { defaultHomewareCandleMockupImg, homewareCandleMockupList } from "../data/mockupsHomewareCandles";

import { defaultHatCapsMockupImg, hatCapsMockupList } from "../data/mockupsHatCaps";
import { defaultHatBeaniesMockupImg, hatBeaniesMockupList } from "../data/mockupsHatBeanies";
import { defaultHatVisorsMockupImg, hatVisorsMockupList } from "../data/mockupsHatVisors";

import { defaultAccessoriesToteMockupImg, accessoriesToteMockupList } from "../data/mockupsAccessoriesTote";
import { defaultAccessoriesApronMockupImg, accessoriesApronMockupList } from "../data/mockupsAccessoriesApron";
import { defaultAccessoriesPouchSmallMockupImg, accessoriesPouchSmallMockupList } from "../data/mockupsAccessoriesPouchSmall";
import { defaultAccessoriesPouchLargeMockupImg, accessoriesPouchLargeMockupList } from "../data/mockupsAccessoriesPouchLarge";

export const getMockupPackForProduct = (product) => {
  const sub = String(product?.subCategory || product?.subcategory || "").toLowerCase();
  const subCompact = sub.replace(/[\s-]+/g, "");
  const category = String(product?.category || "").toLowerCase();
  const isYouthBaby = category === "yb" || category === "youthbaby";
  const name = String(product?.name || "").toLowerCase();

  if (isYouthBaby) {
    if (sub === "t-shirts" || sub === "tshirt" || subCompact.startsWith("tshirt")) {
      return { key: "tshirt-yb", defaultImg: defaultKidTshirtMockupImg, list: kidTshirtMockupList };
    }
    if (sub === "hoodies" || sub === "hoodie") {
      return { key: "hoodie-yb", defaultImg: defaultKidHoodieMockupImg, list: kidHoodieMockupList };
    }
    if (sub === "sweatshirts" || sub === "sweatshirt") {
      return { key: "sweatshirt-yb", defaultImg: defaultKidSweatshirtMockupImg, list: kidSweatshirtMockupList };
    }
    if (sub === "babycothing" || subCompact.includes("baby")) {
      return { key: "baby-yb", defaultImg: defaultBabyYbMockupImg, list: babyYbMockupList };
    }
  }

  if (category === "drink") {
    if (sub === "mugs") {
      return { key: "mug", defaultImg: defaultDrinkMugMockupImg, list: drinkMugMockupList };
    }
    if (sub === "bottle") {
      return { key: "bottles", defaultImg: defaultDrinkBottleMockupImg, list: drinkBottleMockupList };
    }
    if (sub === "tumblers") {
      return { key: "tumbler", defaultImg: defaultDrinkTumblerMockupImg, list: drinkTumblerMockupList };
    }
    if (sub === "glass") {
      return { key: "glass", defaultImg: defaultDrinkGlassMockupImg, list: drinkGlassMockupList };
    }
  }

  if (category === "homeware") {
    if (sub === "cushion") {
      return { key: "homeware-cushion", defaultImg: defaultHomewareCushionMockupImg, list: homewareCushionMockupList };
    }
    if (sub === "mats") {
      return { key: "homeware-mats", defaultImg: defaultHomewareMatsMockupImg, list: homewareMatsMockupList };
    }
    if (sub === "blankets") {
      return { key: "homeware-blankets", defaultImg: defaultHomewareBlanketsMockupImg, list: homewareBlanketsMockupList };
    }
    if (sub === "ornament") {
      return { key: "homeware-ornament", defaultImg: defaultHomewareOrnamentMockupImg, list: homewareOrnamentMockupList };
    }
    if (sub === "yardsign") {
      return { key: "homeware-yardsign", defaultImg: defaultHomewareYardSignMockupImg, list: homewareYardSignMockupList };
    }
    if (sub === "candle") {
      return { key: "homeware-candle", defaultImg: defaultHomewareCandleMockupImg, list: homewareCandleMockupList };
    }
  }

  if (category === "wallart") {
    if (sub === "poster" || sub === "posters") {
      return { key: "wallart-poster", defaultImg: defaultWallartPosterMockupImg, list: wallartPosterMockupList };
    }
    if (sub === "canvas" || sub === "canvases") {
      return { key: "wallart-canvas", defaultImg: defaultWallartCanvasMockupImg, list: wallartCanvasMockupList };
    }
  }

  if (category === "hat") {
    if (sub === "cap" || sub === "caps") {
      return { key: "hat-cap", defaultImg: defaultHatCapsMockupImg, list: hatCapsMockupList };
    }
    if (sub === "beanie" || sub === "beanies") {
      return { key: "hat-beanie", defaultImg: defaultHatBeaniesMockupImg, list: hatBeaniesMockupList };
    }
    if (sub === "visor" || sub === "visors") {
      return { key: "hat-visor", defaultImg: defaultHatVisorsMockupImg, list: hatVisorsMockupList };
    }
  }

  if (category === "accessories") {
    if (name.includes("tote")) {
      return { key: "accessories-tote", defaultImg: defaultAccessoriesToteMockupImg, list: accessoriesToteMockupList };
    }
    if (name.includes("apron")) {
      return { key: "accessories-apron", defaultImg: defaultAccessoriesApronMockupImg, list: accessoriesApronMockupList };
    }
    if (name.includes("pouch") && name.includes("small")) {
      return { key: "accessories-pouch-small", defaultImg: defaultAccessoriesPouchSmallMockupImg, list: accessoriesPouchSmallMockupList };
    }
    if (name.includes("pouch") && name.includes("large")) {
      return { key: "accessories-pouch-large", defaultImg: defaultAccessoriesPouchLargeMockupImg, list: accessoriesPouchLargeMockupList };
    }
    return { key: "accessories-tote", defaultImg: defaultAccessoriesToteMockupImg, list: accessoriesToteMockupList };
  }

  if (sub === "hoodies" || sub === "hoodie") {
    return { key: "hoodie", defaultImg: defaultHoodieMockupImg, list: hoodieMockupList };
  }
  if (sub === "sweatshirts" || sub === "sweatshirt") {
    return { key: "sweatshirt", defaultImg: defaultSweatshirtMockupImg, list: sweatshirtMockupList };
  }
  if (
    sub === "longsleeve-shirts" ||
    subCompact === "longsleeve" ||
    subCompact === "longsleeves" ||
    subCompact === "longsleeveshirt" ||
    subCompact === "longsleeveshirts" ||
    subCompact.startsWith("longsleeve")
  ) {
    return { key: "longsleeve", defaultImg: defaultLongSleeveMockupImg, list: longSleeveMockupList };
  }
  if (
    sub === "tank-tops" ||
    sub === "tanktop" ||
    sub === "tanktops" ||
    subCompact === "tanktop" ||
    subCompact === "tanktops" ||
    subCompact === "tanktopshirt" ||
    subCompact === "tanktopshirts" ||
    subCompact.startsWith("tanktop")
  ) {
    return { key: "tanktop", defaultImg: defaultTankTopMockupImg, list: tankTopMockupList };
  }

  return { key: "tshirt", defaultImg: defaultTshirtMockupImg, list: tshirtMockupList };
};

export const getOrderedMockups = (mockupPack) => {
  const baseList = Array.isArray(mockupPack?.list) ? mockupPack.list : [];

  if (
    mockupPack?.key === "hoodie" ||
    mockupPack?.key === "sweatshirt" ||
    mockupPack?.key === "longsleeve" ||
    mockupPack?.key === "tanktop" ||
    mockupPack?.key === "tshirt-yb" ||
    mockupPack?.key === "hoodie-yb" ||
    mockupPack?.key === "sweatshirt-yb" ||
    mockupPack?.key === "baby-yb" ||
    mockupPack?.key === "mug" ||
    mockupPack?.key === "bottles" ||
    mockupPack?.key === "tumbler" ||
    mockupPack?.key === "glass" ||
    mockupPack?.key === "homeware-cushion" ||
    mockupPack?.key === "homeware-mats" ||
    mockupPack?.key === "homeware-blankets" ||
    mockupPack?.key === "homeware-ornament" ||
    mockupPack?.key === "homeware-yardsign" ||
    mockupPack?.key === "homeware-candle" ||
    mockupPack?.key === "wallart-poster" ||
    mockupPack?.key === "wallart-canvas" ||
    mockupPack?.key === "hat-cap" ||
    mockupPack?.key === "hat-beanie" ||
    mockupPack?.key === "hat-visor" ||
    mockupPack?.key === "accessories-tote" ||
    mockupPack?.key === "accessories-apron" ||
    mockupPack?.key === "accessories-pouch-small" ||
    mockupPack?.key === "accessories-pouch-large"
  ) {
    return baseList;
  }

  const preferredOrder = [1, 2, 3, 4, 5, 6, 7, 11, 12];
  const byId = new Map(baseList.map((m) => [String(m.id), m]));
  const ordered = preferredOrder.map((id) => byId.get(String(id))).filter(Boolean);
  const seen = new Set(ordered.map((m) => String(m.id)));
  const rest = baseList.filter((m) => !seen.has(String(m.id)));
  return [...ordered, ...rest];
};

export const getGalleryImagesForProduct = (product) => {
  const pack = getMockupPackForProduct(product);
  const ordered = getOrderedMockups(pack);
  const mockupImages = ordered.map((m) => m?.img).filter(Boolean);

  const combined = [pack?.defaultImg, ...mockupImages].filter(Boolean);
  const unique = [];
  const seen = new Set();
  for (const img of combined) {
    if (seen.has(img)) continue;
    seen.add(img);
    unique.push(img);
  }
  return unique;
};
