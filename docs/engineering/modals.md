# Modals and overlays

An overlay owns visibility, focus management and dismissal. A feature owns the meaning of opening it and its typed parameters.

Use a context factory when several descendants need to open the same modal. The factory should expose a small `open(params)`, `close()` and state contract. Keep params as identifiers or commands; do not pass cached DTOs through modal state.

Fetch detail data inside the modal feature from its identifier. This allows list previews to be pulled from QueryClient and avoids stale props becoming a second cache.
