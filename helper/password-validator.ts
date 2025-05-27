export interface PasswordFormErrors {
  password: string;
  confirmPassword: string;
}

export const validatePasswordField = (
  name: string,
  value: string,
  password?: string
) => {
  switch (name) {
    case "password":
      return value.trim() === ""
        ? "Password is required"
        : value.length < 8
        ? "Password must be at least 8 characters"
        : "";
    case "confirmPassword":
      return value.trim() === ""
        ? "Please confirm your password"
        : value !== password
        ? "Passwords do not match"
        : "";
    default:
      return "";
  }
};

export const usePasswordValidation = (
  password: string,
  confirmPassword: string
) => {
  const validateField = (name: string, value: string) => {
    return validatePasswordField(name, value, password);
  };

  const validateAllFields = () => {
    return {
      password: validatePasswordField("password", password),
      confirmPassword: validatePasswordField(
        "confirmPassword",
        confirmPassword,
        password
      ),
    };
  };

  return { validateField, validateAllFields };
};
