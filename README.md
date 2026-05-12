# Moments

***__TRY IT:__*** https://moments-virid.vercel.app

## Inspiration

Recently, I've been getting into an app known as Flighty. It's essentially a flight tracker, showing you where you've flown, what you've flown on, and who you've flown with. A memory capsule for flights, if you will. But no such tool exists for the rest of life's moments. Vacations to exotic destinations, a night out in your hometown with friends, hotel bookings on work trips, or even just serene walks in the park across the street. 

Moments is the app shaped for that wider arc. It still takes flights seriously, but treats them as one of several kinds of memory alongside hotels, restaurants, sights, and plain notes.

## What it does

- **Journal** lists every moment with trip filtering, sort (date, type, rating where it applies), custom tags, and friends
- **Places** organizes trips and destinations
- **Map** shows pins by moment type, optional great circle arcs for flights, and a trip line that connects stops in order
- **Passport** is a curated stats and stamps view: year in review, stamps grouped by theme, and per mode counts
- **Storybook** walks memories in chronological order for a trip or a calendar range
- **Friends** keeps a small roster and lets you tag people on moments.
- **Add flow** supports creating trips, destinations, and moments with kind specific fields (flight legs and IATA style codes, hotel nights and stars, restaurant ratings, and so on). Place search uses Photon geocoding

## Tech stack

- React 18 and TypeScript
- Vite for dev and build
- React Router for the shell routes (journal, map, passport, places, friends, storybook, settings, add flows)
- Anthropic API for passport and stamp curation
- Leaflet and react-leaflet for maps; trip polylines use Catmull Rom smoothing helpers; flight segments use great circle sampling
- Dexie for local photo blobs; optional `@neondatabase/serverless` for cloud state and photo rows when `DATABASE_URL` and auth are set
- Vercel serverless handlers under `api/` for app state (`GET` / `PUT`), photo upload and listing, and AI assisted endpoints used from the client
- Optional `VITE_MOMENTS_SYNC_SECRET` plus `VITE_API_BASE` so the SPA can talk to `/api` when not same origin

## Challenges

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
