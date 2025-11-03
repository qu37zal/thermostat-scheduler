# Component Architecture Guide

**Last Updated**: November 3, 2025

---

## Component Tree

```
┌─ App.tsx ─────────────────────────────────────────────────────┐
│                                                                 │
│  [State]                                                        │
│  - thermostats[]                                                │
│  - loading                                                      │
│  - showDiscovery                                                │
│                                                                 │
│  └─ ThermostatList.tsx (Discovery UI)                          │
│  └─ ThermostatSelector.tsx (Tab switcher)                      │
│     └─ ThermostatStatus.tsx (Main display)                     │
│        │                                                        │
│        ├─ StatusCard.tsx ×6 (Status metrics)                   │
│        │  - Current Temp                                       │
│        │  - Target Temp                                        │
│        │  - Mode                                               │
│        │  - Fan                                                │
│        │  - System State                                       │
│        │  - Hold Status                                        │
│        │                                                        │
│        ├─ ScheduleDisplay.tsx (Read-only view)                 │
│        │  - Displays current heat/cool schedule                │
│        │  - 7 days × 9 time slots grid                         │
│        │                                                        │
│        ├─ ScheduleEditor.tsx (Edit mode) ✨ NEW                │
│        │  - Load schedule for day 0-6                          │
│        │  - Day selector (Mon-Sun tabs)                        │
│        │  - Temperature input grid                             │
│        │  - Save/Cancel buttons                                │
│        │                                                        │
│        └─ HistoryVisualization.tsx (Data + charts)             │
│           ├─ TemperatureTrendChart.tsx (Recharts)              │
│           │  - Avg, Min, Max temps over time                   │
│           │                                                    │
│           ├─ RuntimeHistogram.tsx (Recharts)                   │
│           │  - System runtime per hour                         │
│           │                                                    │
│           └─ HistoryTable.tsx (Last 100 entries)               │
│              - Raw data view                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Core Components

#### App.tsx
- **Purpose**: Main orchestrator and discovery flow
- **State**: Thermostats list, loading, discovery toggle
- **Children**: ThermostatList, ThermostatSelector
- **Key Methods**: fetchThermostats(), handleRefresh(), handleSave()

#### ThermostatSelector.tsx
- **Purpose**: Tab switcher between discovered thermostats
- **Props**: thermostats[], onRefresh, onSave
- **Children**: ThermostatStatus
- **Features**: Tab navigation, multi-thermostat support

#### ThermostatStatus.tsx
- **Purpose**: Main display/control interface for one thermostat
- **Props**: thermostat, onSave
- **State**: isEditing, editingSchedule, loading, editedThermostat
- **Children**: StatusCard×6, ScheduleDisplay, ScheduleEditor, HistoryVisualization
- **Features**:
  - Display current status via StatusCards
  - Toggle between view/edit settings
  - Toggle between view/edit schedule
  - Show schedule and history

### Status Components

#### StatusCard.tsx ✨ NEW
- **Purpose**: Reusable metric display card
- **Props**: title, value, backgroundColor, borderColor, unit
- **Usage**: 6 instances in ThermostatStatus
- **Lines**: 35
- **Example**:
  ```tsx
  <StatusCard
    title="Current Temperature"
    value={currentTemp}
    backgroundColor="#fff3cd"
    borderColor="#ffc107"
    unit="°F"
  />
  ```

### Schedule Components

#### ScheduleDisplay.tsx
- **Purpose**: Read-only schedule viewing
- **Props**: ipAddress, mode ("heat" | "cool")
- **Features**: Grid layout for 7 days × 9 time slots
- **API**: GET /api/thermostats/{ipAddress}/program/{mode}/{day}

#### ScheduleEditor.tsx ✨ NEW
- **Purpose**: Interactive schedule editing
- **Props**: ipAddress, mode, onSave, onCancel
- **State**:
  - schedule[] (all 7 days)
  - selectedDay (0-6)
  - loading, saving, error
- **Features**:
  - Load schedule from backend
  - Day selector tabs
  - Temperature input grid (9 slots/day)
  - Validation (50-90°F)
  - Save/Cancel actions
- **API**:
  - GET: Load schedule for each day
  - POST: Save changes for selected day
- **Lines**: 350

### History Components

#### HistoryVisualization.tsx (Refactored)
- **Purpose**: Orchestrates history display (charts or table)
- **Props**: ipAddress, hoursBack
- **State**: history[], view ("chart" | "table"), loading, error
- **Features**:
  - Fetch history data
  - Calculate hourly aggregates
  - Toggle between chart and table views
  - Process data for charts
- **Children**: TemperatureTrendChart, RuntimeHistogram, HistoryTable
- **Lines**: 130 (was 370)

#### TemperatureTrendChart.tsx ✨ NEW
- **Purpose**: Temperature trend visualization
- **Props**: data (ChartData[])
- **Library**: Recharts ComposedChart
- **Features**:
  - Avg temp (solid line, orange)
  - Max temp (dashed line, red)
  - Min temp (dashed line, blue)
  - 48-hour window
  - Smart x-axis labels
  - Interactive tooltip
- **Lines**: 70

#### RuntimeHistogram.tsx ✨ NEW
- **Purpose**: System runtime histogram
- **Props**: data (ChartData[])
- **Library**: Recharts BarChart
- **Features**:
  - Total runtime bars (green, #4caf50)
  - 48-hour window
  - Smart x-axis labels
  - Interactive tooltip
- **Lines**: 60

#### HistoryTable.tsx ✨ NEW
- **Purpose**: Raw history data table
- **Props**: history (HistoryEntry[])
- **Features**:
  - 6 columns: Timestamp, Temp, Setpoint, Mode, Fan, Runtime
  - Last 100 entries in reverse order
  - Alternating row colors
  - Responsive horizontal scroll
- **Lines**: 70

---

## Data Interfaces

### Thermostat
```typescript
interface Thermostat {
  id: string;
  name: string;
  ipAddress: string;
  model?: string;
  currentTemp?: number;
  targetTemp?: number;
  status?: string;
  apiUrl?: string;
  tmode?: number;      // 0=off, 1=heat, 2=cool, 3=auto
  fmode?: number;      // 0=off, 1=on, 2=auto
  tstate?: number;     // 0=off, 1=running
  hold?: number;       // 0=no, 1=yes
  t_heat?: number;     // heating setpoint
  t_cool?: number;     // cooling setpoint
  temp?: number;       // current temperature
}
```

### HistoryEntry
```typescript
interface HistoryEntry {
  id?: number;
  timestamp: string;
  temperature?: number;
  setpoint?: number;
  mode?: string;
  fan_mode?: string;
  runtime_minutes?: number;
}
```

### ChartData
```typescript
interface ChartData {
  hour: string;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  totalRuntime: number;
}
```

### DaySchedule
```typescript
interface DaySchedule {
  day: number;
  dayName: string;
  slots: TimeSlot[];
}

interface TimeSlot {
  time: string;
  hour: number;
  temperature: number;
}
```

---

## State Flow

### Discovery Flow
```
App
├─ [showDiscovery=true]
├─ → ThermostatList
│  └─ [Scan network, enter IP]
│  └─ → Save thermostat
│  └─ → Trigger refresh
└─ [showDiscovery=false on success]
└─ → ThermostatSelector with thermostats
```

### Status Display Flow
```
ThermostatStatus
├─ [Load on mount]
├─ API: GET /api/thermostats
└─ Render:
   ├─ StatusCard × 6
   ├─ ScheduleDisplay (if tmode !== 0)
   └─ HistoryVisualization
```

### Schedule Edit Flow
```
ThermostatStatus
├─ [User clicks "Edit Schedule"]
├─ [editingSchedule = true]
├─ → ScheduleEditor
│  ├─ [Load schedule]
│  ├─ API: GET /api/thermostats/{ip}/program/{mode}/{day} × 7
│  ├─ [User selects day]
│  ├─ [User enters temperatures]
│  ├─ [Validation runs on input]
│  ├─ [User clicks Save]
│  ├─ API: POST /api/thermostats/{ip}/program/{mode}/{day}
│  └─ [onSave callback]
└─ [editingSchedule = false]
└─ → ScheduleDisplay re-renders
```

---

## Props Drilling Optimizations

**Could be optimized with Context API** (if needed):
- Thermostat object drilling through ThermostatStatus to child components
- Refresh handler passed to multiple levels

**Current approach is fine** because:
- Only 2-3 levels of drilling
- Props are explicit and traceable
- Easier to debug than Context
- Performance is not impacted

---

## Styling Architecture

### Color Scheme
```
Status Cards:
- Temperature (current):  #fff3cd bg, #ffc107 border
- Target Temp:           #e7f3ff bg, #0071b8 border
- Mode:                  #f0f0f0 bg, #999 border
- Fan:                   #e8f5e9 bg, #4caf50 border
- System State:          #fff4e6/#f3f3f3 bg, #ff9800/#ccc border
- Hold Mode:             #fccccc/#f3f3f3 bg, #d32f2f/#ccc border

Buttons:
- Primary (Edit):        #007bff
- Secondary (Schedule):  #17a2b8
- Success (Save):        #28a745
- Danger (Cancel):       #6c757d

Charts:
- Avg Temp:              #ff9800 (orange)
- Max Temp:              #f44336 (red)
- Min Temp:              #2196f3 (blue)
- Runtime:               #4caf50 (green)

UI Elements:
- Background:            #fff
- Borders:               #ddd
- Text:                  #333
- Secondary Text:        #666
- Error:                 #721c24 on #f8d7da
```

### Layout Patterns
- Grid for status cards: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`
- Grid for day buttons: `repeat(auto-fit, minmax(80px, 1fr))`
- Flexbox for buttons: `display: flex; gap: 1rem; flex-wrap: wrap`
- Table for schedules: `width: 100%; border-collapse: collapse`

---

## Testing Checklist

### Unit Tests (Future)
- [ ] StatusCard renders correctly with all props
- [ ] TemperatureTrendChart handles empty data
- [ ] RuntimeHistogram calculates correctly
- [ ] HistoryTable displays last 100 entries
- [ ] ScheduleEditor validates temperature inputs
- [ ] ScheduleEditor formats payload correctly

### Integration Tests (Future)
- [ ] App discovery flow → ThermostatStatus
- [ ] ThermostatStatus → ScheduleEditor → Save
- [ ] ThermostatStatus → HistoryVisualization → Charts render
- [ ] Tab switching between thermostats

### Manual Testing
- [ ] All components compile without errors
- [ ] Status cards render with correct colors
- [ ] Schedule editor loads all 7 days
- [ ] Temperature validation shows errors
- [ ] Save button disabled during POST
- [ ] Cancel button reverts to display
- [ ] Charts display with real data
- [ ] Table scrolls horizontally on small screens

---

## Performance Considerations

### Current Optimizations
- Child components memoization ready (no hooks issues)
- Re-renders isolated to affected components
- API calls debounced at app level (30s refresh interval)

### Future Optimizations
- `React.memo()` on StatusCard (used 6x)
- `useCallback()` for event handlers in ScheduleEditor
- `useMemo()` for chart data aggregation
- Virtual scrolling for history table (100+ rows)

---

## Migration Path for Future Features

### Adding New Status Metric
1. Create new StatusCard with appropriate colors
2. Add to ThermostatStatus JSX in grid
3. Add data extraction from Thermostat object

### Adding New Chart Type
1. Create new chart component in `/charts` folder
2. Import into HistoryVisualization
3. Add data prop and conditional rendering
4. Add to view toggle options

### Adding New Schedule Editor Feature
1. Extend ScheduleEditor interfaces
2. Add UI elements (buttons, inputs, etc.)
3. Implement state management
4. Update API payload format
5. Wire into ThermostatStatus

---

## Files Summary

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| App.tsx | Component | 75 | Main orchestrator |
| ThermostatList.tsx | Component | 150 | Discovery UI |
| ThermostatSelector.tsx | Component | 150 | Tab switcher |
| **ThermostatStatus.tsx** | Component | 200 | Status display ✏️ |
| **StatusCard.tsx** | Component | 35 | Metric card ✨ |
| ScheduleDisplay.tsx | Component | 200 | Schedule view |
| **ScheduleEditor.tsx** | Component | 350 | Schedule edit ✨ |
| HistoryVisualization.tsx | Component | 130 | Charts/table ✏️ |
| **TemperatureTrendChart.tsx** | Component | 70 | Trend chart ✨ |
| **RuntimeHistogram.tsx** | Component | 60 | Runtime chart ✨ |
| **HistoryTable.tsx** | Component | 70 | Data table ✨ |

**Legend**: ✨ NEW, ✏️ REFACTORED, (unchanged)

---

## Next Steps

### Immediate
1. ✅ Test all components compile
2. ✅ Test status cards render
3. ✅ Test schedule editor loads
4. ✅ Test chart components display

### Short-term
1. Deploy to testing environment
2. Manual QA on all features
3. Performance profiling
4. User feedback collection

### Medium-term
1. Unit tests for critical functions
2. Component snapshot tests
3. E2E tests for main flows
4. Accessibility audit (a11y)

### Long-term
1. Multi-day schedule editing
2. Temperature presets
3. Schedule templates/cloning
4. Data export (CSV/JSON)
