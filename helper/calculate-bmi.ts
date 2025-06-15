// MBI for kg and cm = weight(kg) / (height(m) * height(m))
// MBI for lb and ft = weight(lb) / (height(in) * height(in)) * 703

export const calculateBMI = (userInfo: any) => {
  let bmi = 0;
  let bmiCategory = "";
  let bmiCategoryColor = "";
  let userHeight = 0;

  if (!userInfo?.data?.height || !userInfo?.data?.current_weight) return;

  if (
    userInfo?.data?.height_unit === "cm" &&
    userInfo?.data?.current_weight_unit === "kg"
  ) {
    userHeight = userInfo?.data?.height / 100;
    bmi = Number.parseFloat(
      (userInfo?.data?.current_weight / (userHeight * userHeight)).toFixed(1)
    );
  } else if (
    userInfo?.data?.height_unit === "ft" &&
    userInfo?.data?.current_weight_unit === "lb"
  ) {
    userHeight = userInfo?.data?.height; // in inches
    bmi = Number.parseFloat(
      (
        (userInfo?.data?.current_weight / (userHeight * userHeight)) *
        703
      ).toFixed(1)
    );
  }

  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiCategoryColor = "text-blue-500";
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = "Normal weight";
    bmiCategoryColor = "text-green-500";
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = "Overweight";
    bmiCategoryColor = "text-yellow-500";
  } else {
    bmiCategory = "Obese";
    bmiCategoryColor = "text-red-500";
  }

  return { bmi, bmiCategory, bmiCategoryColor };
};
