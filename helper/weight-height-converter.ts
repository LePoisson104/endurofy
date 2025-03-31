export const convertWeight = (weight: number, weightUnit: string) => {
  let from = "";
  let to = "";

  if (weightUnit === "kg") {
    from = "kg";
    to = "lb";
  } else if (weightUnit === "lb") {
    from = "lb";
    to = "kg";
  }

  if (from === "kg" && to === "lb") {
    return parseFloat((weight * 2.20462).toFixed(2));
  } else if (from === "lb" && to === "kg") {
    return parseFloat((weight / 2.20462).toFixed(2));
  }
  return weight;
};

export const convertHeight = (height: number, heightUnit: string) => {
  let from = "";
  let to = "";

  if (heightUnit === "cm") {
    from = "cm";
    to = "ft";
  } else if (heightUnit === "ft") {
    from = "ft";
    to = "cm";
  }

  if (from === "cm" && to === "ft") {
    return height / 2.54;
  } else if (from === "ft" && to === "cm") {
    return height * 2.54;
  }

  return height;
};

export const getHeightInFeetAndMeters = (
  height: number,
  heightUnit: string
) => {
  let newHeight = "";
  if (heightUnit === "cm") {
    let meter = Math.floor(height / 100);
    let centimeter = height % 100;
    newHeight = `${meter} m ${centimeter} cm`;
  } else if (heightUnit === "ft") {
    let feet = Math.floor(height / 12);
    let inches = height % 12;
    newHeight = `${feet} ft ${inches} in`;
  }
  return newHeight;
};
