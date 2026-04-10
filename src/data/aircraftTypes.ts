/** Common commercial & regional types for flight logging (label shown in UI). */
export const AIRCRAFT_TYPES: { value: string; label: string }[] = [
  { value: '', label: '—' },
  { value: 'A220-100', label: 'Airbus A220-100' },
  { value: 'A220-300', label: 'Airbus A220-300' },
  { value: 'A318', label: 'Airbus A318' },
  { value: 'A319', label: 'Airbus A319' },
  { value: 'A320', label: 'Airbus A320' },
  { value: 'A320neo', label: 'Airbus A320neo' },
  { value: 'A321', label: 'Airbus A321' },
  { value: 'A321neo', label: 'Airbus A321neo' },
  { value: 'A321LR', label: 'Airbus A321LR' },
  { value: 'A321XLR', label: 'Airbus A321XLR' },
  { value: 'A330-200', label: 'Airbus A330-200' },
  { value: 'A330-300', label: 'Airbus A330-300' },
  { value: 'A330-800', label: 'Airbus A330-800neo' },
  { value: 'A330-900', label: 'Airbus A330-900neo' },
  { value: 'A340-300', label: 'Airbus A340-300' },
  { value: 'A340-600', label: 'Airbus A340-600' },
  { value: 'A350-900', label: 'Airbus A350-900' },
  { value: 'A350-1000', label: 'Airbus A350-1000' },
  { value: 'A380-800', label: 'Airbus A380-800' },
  { value: 'B717', label: 'Boeing 717' },
  { value: 'B737-700', label: 'Boeing 737-700' },
  { value: 'B737-800', label: 'Boeing 737-800' },
  { value: 'B737-900', label: 'Boeing 737-900' },
  { value: 'B737-900ER', label: 'Boeing 737-900ER' },
  { value: 'B737-MAX7', label: 'Boeing 737 MAX 7' },
  { value: 'B737-MAX8', label: 'Boeing 737 MAX 8' },
  { value: 'B737-MAX9', label: 'Boeing 737 MAX 9' },
  { value: 'B737-MAX10', label: 'Boeing 737 MAX 10' },
  { value: 'B747-400', label: 'Boeing 747-400' },
  { value: 'B747-8', label: 'Boeing 747-8' },
  { value: 'B757-200', label: 'Boeing 757-200' },
  { value: 'B757-300', label: 'Boeing 757-300' },
  { value: 'B767-300', label: 'Boeing 767-300' },
  { value: 'B767-400', label: 'Boeing 767-400ER' },
  { value: 'B777-200', label: 'Boeing 777-200' },
  { value: 'B777-200ER', label: 'Boeing 777-200ER' },
  { value: 'B777-300', label: 'Boeing 777-300' },
  { value: 'B777-300ER', label: 'Boeing 777-300ER' },
  { value: 'B777X', label: 'Boeing 777X' },
  { value: 'B787-8', label: 'Boeing 787-8' },
  { value: 'B787-9', label: 'Boeing 787-9' },
  { value: 'B787-10', label: 'Boeing 787-10' },
  { value: 'E170', label: 'Embraer E170' },
  { value: 'E175', label: 'Embraer E175' },
  { value: 'E190', label: 'Embraer E190' },
  { value: 'E195', label: 'Embraer E195' },
  { value: 'E195-E2', label: 'Embraer E195-E2' },
  { value: 'CRJ200', label: 'Bombardier CRJ200' },
  { value: 'CRJ700', label: 'Bombardier CRJ700' },
  { value: 'CRJ900', label: 'Bombardier CRJ900' },
  { value: 'ATR72', label: 'ATR 72' },
  { value: 'DHC-8', label: 'De Havilland Dash 8' },
  { value: 'other', label: 'Other / unknown' },
]

export const CABIN_CLASSES = [
  { value: '', label: '—' },
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
] as const

export function aircraftLabel(code: string | undefined): string {
  if (!code) return ''
  const row = AIRCRAFT_TYPES.find((a) => a.value === code)
  return row?.label ?? code
}

export function cabinLabel(code: string | undefined): string {
  if (!code) return ''
  const row = CABIN_CLASSES.find((c) => c.value === code)
  return row?.label ?? code
}
