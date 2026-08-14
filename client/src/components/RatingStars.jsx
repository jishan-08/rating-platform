import { useState } from "react";

const STAR_LABELS = {
    1: "1 star — Poor",
    2: "2 stars — Fair",
    3: "3 stars — Good",
    4: "4 stars — Very Good",
    5: "5 stars — Excellent",
};

/**
 * RatingStars Component
 * Renders an accessible 1-5 star rating display or interactive rating selector.
 *
 * @param {Object} props
 * @param {number} props.value - Currently selected rating (0 to 5)
 * @param {function} [props.onChange] - Callback fired when a star is selected
 * @param {boolean} [props.interactive] - Force interactive mode
 * @param {boolean} [props.readOnly=false] - Force static display mode
 * @param {string} [props.size="md"] - Size variant: "sm", "md", "lg"
 * @param {boolean} [props.disabled=false] - Disable interactions
 * @param {string} [props.ariaLabel="Rating"] - Accessible label for screen readers
 */
function RatingStars({
    value = 0,
    onChange,
    interactive,
    readOnly = false,
    size = "md",
    disabled = false,
    ariaLabel = "Rating",
}) {
    const [hoverValue, setHoverValue] = useState(0);

    const isInteractive = !readOnly && (interactive || typeof onChange === "function");
    const activeRating = isInteractive && hoverValue > 0 ? hoverValue : (Number(value) || 0);

    const sizeStyles = {
        sm: { fontSize: "1rem", gap: "2px" },
        md: { fontSize: "1.45rem", gap: "4px" },
        lg: { fontSize: "2rem", gap: "6px" },
    };

    const currentStyle = sizeStyles[size] || sizeStyles.md;

    // Non-interactive display mode
    if (!isInteractive) {
        return (
            <div
                className="rating-stars"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: currentStyle.gap,
                    fontSize: currentStyle.fontSize,
                    lineHeight: 1,
                }}
                aria-label={`${ariaLabel}: ${value || 0} out of 5 stars`}
                title={`${value || 0} / 5`}
            >
                {[1, 2, 3, 4, 5].map((starIndex) => {
                    const isFilled = starIndex <= Math.round(Number(value) || 0);
                    return (
                        <span
                            key={starIndex}
                            style={{
                                color: isFilled ? "#e8a33a" : "#d1d5db",
                                transition: "color 0.15s ease",
                                userSelect: "none",
                            }}
                            aria-hidden="true"
                        >
                            {isFilled ? "★" : "☆"}
                        </span>
                    );
                })}
            </div>
        );
    }

    // Interactive selector mode
    return (
        <div
            className="rating-stars rating-stars--interactive"
            role="radiogroup"
            aria-label={ariaLabel}
            onMouseLeave={() => setHoverValue(0)}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: currentStyle.gap,
            }}
        >
            {[1, 2, 3, 4, 5].map((starIndex) => {
                const isSelected = starIndex <= activeRating;
                const label = STAR_LABELS[starIndex] || `${starIndex} stars`;

                return (
                    <button
                        key={starIndex}
                        type="button"
                        role="radio"
                        aria-checked={Number(value) === starIndex}
                        aria-label={label}
                        disabled={disabled}
                        onClick={() => {
                            if (!disabled && onChange) {
                                onChange(starIndex);
                                setHoverValue(0);
                            }
                        }}
                        onMouseEnter={() => {
                            if (!disabled) {
                                setHoverValue(starIndex);
                            }
                        }}
                        onFocus={() => {
                            if (!disabled) {
                                setHoverValue(starIndex);
                            }
                        }}
                        onBlur={() => setHoverValue(0)}
                        style={{
                            background: "transparent",
                            border: "none",
                            padding: "2px 3px",
                            margin: 0,
                            cursor: disabled ? "not-allowed" : "pointer",
                            fontSize: currentStyle.fontSize,
                            lineHeight: 1,
                            color: isSelected ? "#e8a33a" : "#d1d5db",
                            transition: "transform 0.12s ease, color 0.12s ease",
                            transform: hoverValue === starIndex ? "scale(1.22)" : "scale(1)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                        }}
                    >
                        <span aria-hidden="true">{isSelected ? "★" : "☆"}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default RatingStars;
