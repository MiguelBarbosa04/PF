const StarsRating = ({ avaliacao, onAvaliar }) => {
  return (
    <div className="stars-rating">
      {[1,2,3,4,5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (avaliacao || 0) ? "selected" : ""}`}
          onClick={() => onAvaliar(star)}
          style={{ cursor: "pointer", color: star <= (avaliacao || 0) ? "gold" : "gray" }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarsRating;