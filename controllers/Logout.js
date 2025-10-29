const logout = async (req, res) => {
  res.clearCookie("token");
  res.clearCookie("email");
  res.clearCookie("role");
  res.clearCookie("name");
  res.status(200).json({
    message: "the user logout succes fully",
  });
};
export { logout };

