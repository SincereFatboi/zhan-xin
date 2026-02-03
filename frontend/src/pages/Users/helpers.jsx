import * as yup from "yup";

export const userSchema = yup.object().shape({
  firstName: yup
    .string()
    .required("required*")
    .matches(/^[A-Za-z]+$/, "only letters are allowed*"),
  lastName: yup
    .string()
    .required("required*")
    .matches(/^[A-Za-z]+$/, "only letters are allowed*"),
  username: yup
    .string()
    .required("required*")
    .matches(
      /^[a-z0-9._]+$/,
      "only lowercase letters, numbers, _ and . are allowed*",
    ),
});
