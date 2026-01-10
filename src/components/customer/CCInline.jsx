const CCInline = ({ size = "1em" }) => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: size,
        fontWeight: "inherit",
        lineHeight: "1",
      }}
    >
      <span>C</span>
      <span
        style={{
          fontSize: "0.7em",
          margin: "0 0.15em",
          transform: "translateY(-0.05em)",
        }}
      >
        •
      </span>
      <span>C</span>
    </span>
  );
};

export default CCInline;
