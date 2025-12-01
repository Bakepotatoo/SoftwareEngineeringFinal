// public/js/registerFunctionality.js

// PURE LOGIC ONLY – no firebase imports, no DOM

export async function handleRegister(formValues, deps) {
  const { email, password, username, confirmPassword } = formValues;

  const {
    auth,
    createUserWithEmailAndPassword,
    addUserToFirestore,
    alertFn,
    redirectFn,
  } = deps;

  if (password !== confirmPassword) {
    alertFn(
      "Passwords do not match. Please enter the same passwords in both fields."
    );
    return;
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  alertFn("Your account has been created!");

  await addUserToFirestore(user.uid, username, email);

  redirectFn("launcherone_profile.html");
}
