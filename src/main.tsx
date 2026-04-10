import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { migratePhotosDbFromLegacy } from './db/photosDb'
import { isNeonSyncEnabled } from './lib/syncEnv'

import L from 'leaflet'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

// Default icon paths for any classic markers (we use divIcons for pins)
const DefaultIcon = L.icon({ iconUrl: icon, iconRetinaUrl: iconRetina, shadowUrl: shadow, iconSize: [25, 41], iconAnchor: [12, 41] })
L.Marker.prototype.options.icon = DefaultIcon

const root = document.getElementById('root')!

function mount() {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

if (isNeonSyncEnabled()) {
  mount()
} else {
  void migratePhotosDbFromLegacy().finally(mount)
}
