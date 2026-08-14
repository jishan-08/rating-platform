function Input({ id, label, hint, error, style, className = "", ...props }) {
    return (
        <div className={`form-field ${error ? "form-field--error" : ""} ${className}`.trim()}>
            {label && <label htmlFor={id}>{label}</label>}
            <input
                id={id}
                aria-describedby={hint || error ? `${id}-message` : undefined}
                aria-invalid={Boolean(error)}
                style={{
                    ...(Boolean(error)
                        ? {
                              borderColor: "#dc2626",
                              backgroundColor: "#fff8f8",
                              boxShadow: "0 0 0 1px #dc2626",
                          }
                        : {}),
                    ...style,
                }}
                {...props}
            />
            {(hint || error) && (
                <p
                    id={`${id}-message`}
                    className={error ? "field-error" : "field-hint"}
                    style={
                        error
                            ? {
                                  color: "#dc2626",
                                  fontSize: "0.82rem",
                                  marginTop: "0.25rem",
                                  fontWeight: 600,
                              }
                            : {}
                    }
                >
                    {error || hint}
                </p>
            )}
        </div>
    );
}

export default Input;
