function Input({ id, label, hint, error, ...props }) {
    return (
        <div className="form-field">
            <label htmlFor={id}>{label}</label>
            <input id={id} aria-describedby={hint || error ? `${id}-message` : undefined} {...props} />
            {(hint || error) && (
                <p id={`${id}-message`} className={error ? "field-error" : "field-hint"}>
                    {error || hint}
                </p>
            )}
        </div>
    );
}

export default Input;
