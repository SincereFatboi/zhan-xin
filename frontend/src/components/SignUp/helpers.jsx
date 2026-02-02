import * as yup from "yup";

export const schema = yup.object().shape({
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
  password: yup
    .string()
    .required("required*")
    .min(8, "must be at least 8 characters*"),
  // .matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
  //   "contains at least 1 uppercase, 1 lowercase, and 1 special character",
  // ),
});
