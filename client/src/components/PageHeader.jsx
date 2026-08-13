function PageHeader({ eyebrow, title, children }) {
    return (
        <header className="page-header">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {children && <div className="page-header__content">{children}</div>}
        </header>
    );
}

export default PageHeader;
