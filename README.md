# Moments

## Inspiration

Flight apps are built for one slice of a trip: wheels up, wheels down, the line on the map between two airports. That focus is great for flying itself. Most of what you remember later is everything around that slice: where you stayed, what you ate, the museum you hit on a rainy afternoon, a note you do not want to lose.

Moments is the app shaped for that wider arc. It still takes flights seriously (airports, cabin, aircraft, great circle routes on the map), but treats them as one of several kinds of memory alongside hotels, restaurants, sights, and plain notes.

## What it does

- **Journal** lists every moment with trip filtering, sort (date, type, rating where it applies), tags, and friends. Cards can show the first photo as a full background when you have images attached.
- **Places** organizes trips and destinations; moments always sit under a trip and a destination.
- **Map** shows pins by moment type, optional great circle arcs for flights, and a trip line that connects stops in order. You can filter by kind, limit to one trip, replay the line animation, and open a moment from the map.
- **Passport** is a stats and stamps view: year in review, stamps grouped by theme, and per mode counts. Toggle between a denser stamp book layout and a simpler layout.
- **Storybook** walks memories in chronological order for a trip or a calendar range, one slide per moment with map context.
- **Friends** keeps a small roster and lets you tag people on moments.
- **Add flow** supports creating trips, destinations, and moments with kind specific fields (flight legs and IATA style codes, hotel nights and stars, restaurant ratings, and so on). Place search uses Photon geocoding (proxied in local dev).
- **Settings** edits tag categories, choice lists, UI sound on save, and loading bundled demo data with sample photos.

Structured data lives in a single client state tree persisted to `localStorage` under `moments-travel-v2`. If you configure sync, the same JSON blob can be loaded and saved through a small hosted API backed by Neon. Photos are stored in IndexedDB with Dexie by default, or in Postgres when remote sync is enabled.

## Tech stack

- React 18 and TypeScript
- Vite for dev and build
- React Router for the shell routes (journal, map, passport, places, friends, storybook, settings, add flows)
- Leaflet and react-leaflet for maps; trip polylines use Catmull Rom smoothing helpers; flight segments use great circle sampling
- Dexie for local photo blobs; optional `@neondatabase/serverless` for cloud state and photo rows when `DATABASE_URL` and auth are set
- Vercel serverless handlers under `api/` for app state (`GET` / `PUT`), photo upload and listing, and AI assisted endpoints used from the client
- Optional `VITE_MOMENTS_SYNC_SECRET` plus `VITE_API_BASE` so the SPA can talk to `/api` when not same origin

## Challenges

### State and photos in two places

The core journal is offline first: local JSON in `localStorage` and blobs in IndexedDB. Turning on sync means the same mental model has to work when JSON lives in Postgres and photos sit in bytea rows. The client debounces remote saves, falls back cleanly when the API is down or unauthorized, and routes photo calls to local or remote implementations based on whether sync is active.

### Flights on the map

A flight memory needs sensible endpoints. The app resolves coordinates from saved lat lng, or looks up IATA codes against a bundled airport table. The arc skips a duplicate pin at the midpoint when the route is drawn. Colors are stable per memory id so several legs stay distinguishable.

### Trip line feel

Chronological points are not enough for a polyline you want to animate. The path is smoothed so the line does not look like rigid spreadsheet segments. Playback grows the polyline over time and ties into trip selection and replay, which sounds simple until you juggle fit bounds, filtered kinds, and flights that already occupy the map.

### Rich moments without a bloated form

Five kinds share one editor shape with different optional blocks. Tag categories and choice lists are user configurable so the same UI can flex for moods, cuisines, or cabin class without hard coding every list in the component tree.

### Geocoding from the browser

Photon search is debounced and runs through the Vite proxy in development to avoid CORS pain. Picking a result has to update labels, country codes, and the map picker in sync so the saved moment matches what you saw while typing.

### Passport summaries

Aggregating stamps and yearly cards from heterogeneous memories is straightforward; making the page feel like a coherent digest (including optional model generated blurbs merged into curated slots) runs into the usual problem: helpful text should sound like a person, not a brochure. The server side AI route is written around that constraint.
