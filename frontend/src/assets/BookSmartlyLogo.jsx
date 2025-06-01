function BookSmartlyLogo({ fillColor }) {
  return (
    <div>
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 200 60"
      >
        {/* IPLC Logo - Simple text-based representation */}
        <text
          x="10"
          y="35"
          fontSize="24"
          fontWeight="bold"
          fill={fillColor || "#4f4fcc"}
          fontFamily="Arial, sans-serif"
        >
          IPLC
        </text>
        <text
          x="80"
          y="35"
          fontSize="18"
          fill={fillColor || "#4f4fcc"}
          fontFamily="Arial, sans-serif"
        >
          BookSmartly
        </text>
      </svg>
    </div>
  );
}

export default BookSmartlyLogo;
