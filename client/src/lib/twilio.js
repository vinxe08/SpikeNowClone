export const getTurnCredentials = async () => {
  try {
    const response = await fetch("api/get-turn-credentials");

    if (response) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    return { error };
  }
};
