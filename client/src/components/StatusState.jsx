function StatusState({ type = "empty", title, children }) {
    return (
        <div className={`status-state status-state--${type}`} role={type === "error" ? "alert" : undefined}>
            <h2>{title}</h2>
            {children && <p>{children}</p>}
        </div>
    );
}

export function LoadingState() {
    return <StatusState type="loading" title="Loading">Please wait a moment.</StatusState>;
}

export function EmptyState({ title = "Nothing here yet", children }) {
    return <StatusState type="empty" title={title}>{children}</StatusState>;
}

export function ErrorMessage({ children }) {
    return <StatusState type="error" title="Something needs attention">{children}</StatusState>;
}
