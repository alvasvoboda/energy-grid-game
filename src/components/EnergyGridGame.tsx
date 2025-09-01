import React, { useState, useCallback } from 'react'
import { Battery, Sun, Flame, Users, Zap, Play, RotateCcw, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface GridEntity {
  id: string
  x: number
  y: number
  type: 'customer' | 'solar' | 'gas' | 'battery' | 'playerBattery'
}

interface Customer extends GridEntity {
  type: 'customer'
  demand: number
}

interface SolarFarm extends GridEntity {
  type: 'solar'
  output: number
  capacity: number
}

interface GasPlant extends GridEntity {
  type: 'gas'
  output: number
  capacity: number
}

interface Battery extends GridEntity {
  type: 'battery'
  capacity: number
  currentStorage: number
  maxStorage: number
  output: number
  efficiency: number
}

interface PlayerBattery extends GridEntity {
  type: 'playerBattery'
  capacity: number
  currentStorage: number
  maxStorage: number
  output: number
  efficiency: number
}

const EnergyGridGame: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [solarFarms, setSolarFarms] = useState<SolarFarm[]>([])
  const [gasPlants, setGasPlants] = useState<GasPlant[]>([])
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [playerBattery, setPlayerBattery] = useState<PlayerBattery | null>(null)
  const [isDeficit, setIsDeficit] = useState(false)
  const [playerRevenue, setPlayerRevenue] = useState(0)
  const [placingBattery, setPlacingBattery] = useState(false)
  const [step, setStep] = useState(0)

  const generateRandomPosition = useCallback((existingEntities: GridEntity[]) => {
    let x, y
    let attempts = 0
    do {
      x = Math.floor(Math.random() * 10)
      y = Math.floor(Math.random() * 10)
      attempts++
    } while (
      existingEntities.some(entity => entity.x === x && entity.y === y) &&
      attempts < 100
    )
    return { x, y }
  }, [])

  const initializeGame = useCallback(() => {
    const allEntities: GridEntity[] = []

    // Generate customers
    const newCustomers: Customer[] = []
    for (let i = 0; i < 5; i++) {
      const pos = generateRandomPosition(allEntities)
      const customer: Customer = {
        id: `customer-${i}`,
        type: 'customer',
        x: pos.x,
        y: pos.y,
        demand: Math.floor(Math.random() * 10) + 1
      }
      newCustomers.push(customer)
      allEntities.push(customer)
    }

    // Generate solar farms
    const newSolarFarms: SolarFarm[] = []
    const solarCount = Math.floor(Math.random() * 5) + 3
    for (let i = 0; i < solarCount; i++) {
      const pos = generateRandomPosition(allEntities)
      const capacity = Math.floor(Math.random() * 5) + 1
      const solarFarm: SolarFarm = {
        id: `solar-${i}`,
        type: 'solar',
        x: pos.x,
        y: pos.y,
        capacity,
        output: Math.floor(Math.random() * capacity)
      }
      newSolarFarms.push(solarFarm)
      allEntities.push(solarFarm)
    }

    // Generate gas plants
    const newGasPlants: GasPlant[] = []
    const gasCount = Math.floor(Math.random() * 3) + 3
    for (let i = 0; i < gasCount; i++) {
      const pos = generateRandomPosition(allEntities)
      const capacity = Math.floor(Math.random() * 5) + 1
      const gasPlant: GasPlant = {
        id: `gas-${i}`,
        type: 'gas',
        x: pos.x,
        y: pos.y,
        capacity,
        output: 0
      }
      newGasPlants.push(gasPlant)
      allEntities.push(gasPlant)
    }

    // Generate NPC batteries
    const newBatteries: Battery[] = []
    const batteryCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < batteryCount; i++) {
      const pos = generateRandomPosition(allEntities)
      const capacity = Math.floor(Math.random() * 4) + 1
      const battery: Battery = {
        id: `battery-${i}`,
        type: 'battery',
        x: pos.x,
        y: pos.y,
        capacity,
        maxStorage: capacity * 4,
        currentStorage: Math.floor(Math.random() * capacity * 2),
        output: 0,
        efficiency: 0.9
      }
      newBatteries.push(battery)
      allEntities.push(battery)
    }

    setCustomers(newCustomers)
    setSolarFarms(newSolarFarms)
    setGasPlants(newGasPlants)
    setBatteries(newBatteries)
    setPlayerBattery(null)
    setIsDeficit(false)
    setPlayerRevenue(0)
    setStep(0)
  }, [generateRandomPosition])

  const updateSystemState = useCallback(() => {
    const totalDemand = customers.reduce((sum, customer) => sum + customer.demand, 0)
    const totalSolar = solarFarms.reduce((sum, farm) => sum + farm.output, 0)
    
    let remainingDeficit = totalDemand - totalSolar
    let newPlayerRevenue = playerRevenue

    // Reset all outputs
    setBatteries(prev => prev.map(battery => ({ ...battery, output: 0 })))
    setGasPlants(prev => prev.map(plant => ({ ...plant, output: 0 })))

    if (remainingDeficit > 0) {
      // Deficit - discharge batteries first
      setBatteries(prev => prev.map(battery => {
        if (remainingDeficit > 0 && battery.currentStorage > 0) {
          const discharge = Math.min(battery.capacity, battery.currentStorage, remainingDeficit)
          remainingDeficit -= discharge
          return {
            ...battery,
            output: discharge,
            currentStorage: battery.currentStorage - discharge
          }
        }
        return battery
      }))

      // Player battery discharge
      if (playerBattery && remainingDeficit > 0 && playerBattery.currentStorage > 0) {
        const discharge = Math.min(playerBattery.capacity, playerBattery.currentStorage, remainingDeficit)
        remainingDeficit -= discharge
        newPlayerRevenue += discharge * 100 // $100/MWh
        setPlayerBattery(prev => prev ? {
          ...prev,
          output: discharge,
          currentStorage: prev.currentStorage - discharge
        } : null)
      }

      // Then dispatch gas plants
      if (remainingDeficit > 0) {
        setGasPlants(prev => prev.map(plant => {
          if (remainingDeficit > 0) {
            const output = Math.min(plant.capacity, remainingDeficit)
            remainingDeficit -= output
            return { ...plant, output }
          }
          return plant
        }))
      }

      setIsDeficit(remainingDeficit > 0)
    } else {
      // Surplus - charge batteries
      const surplus = Math.abs(remainingDeficit)
      let remainingSurplus = surplus

      setBatteries(prev => prev.map(battery => {
        if (remainingSurplus > 0 && battery.currentStorage < battery.maxStorage) {
          const maxCharge = Math.min(battery.capacity, battery.maxStorage - battery.currentStorage, remainingSurplus)
          const actualCharge = maxCharge * battery.efficiency
          remainingSurplus -= maxCharge
          return {
            ...battery,
            currentStorage: battery.currentStorage + actualCharge,
            output: -maxCharge // Negative indicates charging
          }
        }
        return battery
      }))

      // Player battery charging
      if (playerBattery && remainingSurplus > 0 && playerBattery.currentStorage < playerBattery.maxStorage) {
        const maxCharge = Math.min(playerBattery.capacity, playerBattery.maxStorage - playerBattery.currentStorage, remainingSurplus)
        const actualCharge = maxCharge * playerBattery.efficiency
        newPlayerRevenue -= maxCharge * 20 // Pay $20/MWh for charging
        setPlayerBattery(prev => prev ? {
          ...prev,
          currentStorage: prev.currentStorage + actualCharge,
          output: -maxCharge
        } : null)
      }

      setIsDeficit(false)
    }

    setPlayerRevenue(newPlayerRevenue)
  }, [customers, solarFarms, batteries, playerBattery, playerRevenue])

  const handleStep = useCallback(() => {
    // Update demands and solar output
    setCustomers(prev => prev.map(customer => ({
      ...customer,
      demand: Math.floor(Math.random() * 10) + 1
    })))

    setSolarFarms(prev => prev.map(farm => ({
      ...farm,
      output: Math.floor(Math.random() * farm.capacity)
    })))

    setStep(prev => prev + 1)
    
    // Update system state after state changes
    setTimeout(updateSystemState, 0)
  }, [updateSystemState])

  const handleReset = useCallback(() => {
    initializeGame()
  }, [initializeGame])

  const handleAddPlayerBattery = useCallback(() => {
    if (!playerBattery) {
      setPlacingBattery(true)
    }
  }, [playerBattery])

  const handleGridClick = useCallback((x: number, y: number) => {
    if (placingBattery) {
      const allEntities = [...customers, ...solarFarms, ...gasPlants, ...batteries]
      if (playerBattery) allEntities.push(playerBattery)
      
      const occupied = allEntities.some(entity => entity.x === x && entity.y === y)
      
      if (!occupied) {
        const capacity = Math.floor(Math.random() * 4) + 1
        const newPlayerBattery: PlayerBattery = {
          id: 'player-battery',
          type: 'playerBattery',
          x,
          y,
          capacity,
          maxStorage: capacity * 4,
          currentStorage: 0,
          output: 0,
          efficiency: 0.9
        }
        setPlayerBattery(newPlayerBattery)
        setPlacingBattery(false)
      }
    }
  }, [placingBattery, customers, solarFarms, gasPlants, batteries, playerBattery])

  // Initialize game on mount
  React.useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const totalDemand = customers.reduce((sum, customer) => sum + customer.demand, 0)
  const totalSolar = solarFarms.reduce((sum, farm) => sum + farm.output, 0)
  const totalGas = gasPlants.reduce((sum, plant) => sum + plant.output, 0)
  const totalBatteryOutput = batteries.reduce((sum, battery) => sum + Math.max(0, battery.output), 0)
  const playerBatteryOutput = playerBattery ? Math.max(0, playerBattery.output) : 0

  const renderEntity = (entity: GridEntity) => {
    const baseProps = {
      key: entity.id,
      cx: entity.x * 40 + 20,
      cy: entity.y * 40 + 20,
    }

    switch (entity.type) {
      case 'customer':
        const customer = entity as Customer
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle
                    {...baseProps}
                    r="8"
                    fill={isDeficit ? "#ef4444" : "#3b82f6"}
                    className={isDeficit ? "animate-pulse" : ""}
                  />
                  <Users
                    x={entity.x * 40 + 12}
                    y={entity.y * 40 + 12}
                    size={16}
                    color="white"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p>Customer: {customer.demand} MWh demand</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      case 'solar':
        const solar = entity as SolarFarm
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle {...baseProps} r="10" fill="#fbbf24" />
                  <Sun
                    x={entity.x * 40 + 12}
                    y={entity.y * 40 + 12}
                    size={16}
                    color="white"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p>Solar: {solar.output}/{solar.capacity} MW</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      case 'gas':
        const gas = entity as GasPlant
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle {...baseProps} r="10" fill="#ef4444" />
                  <Flame
                    x={entity.x * 40 + 12}
                    y={entity.y * 40 + 12}
                    size={16}
                    color="white"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gas Plant: {gas.output}/{gas.capacity} MW</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      case 'battery':
        const battery = entity as Battery
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle {...baseProps} r="10" fill="#8b5cf6" />
                  <Battery
                    x={entity.x * 40 + 12}
                    y={entity.y * 40 + 12}
                    size={16}
                    color="white"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p>NPC Battery: {battery.currentStorage.toFixed(1)}/{battery.maxStorage} MWh</p>
                <p>Output: {battery.output.toFixed(1)} MW</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      case 'playerBattery':
        const playerBat = entity as PlayerBattery
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <circle {...baseProps} r="12" fill="#10b981" />
                  <Battery
                    x={entity.x * 40 + 10}
                    y={entity.y * 40 + 10}
                    size={20}
                    color="white"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your Battery: {playerBat.currentStorage.toFixed(1)}/{playerBat.maxStorage} MWh</p>
                <p>Output: {playerBat.output.toFixed(1)} MW</p>
                <p>Capacity: {playerBat.capacity} MW</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Energy Grid Trading Game
          </CardTitle>
          <CardDescription>
            Manage battery storage to earn revenue in the electricity market. Step: {step}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Grid */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-4 bg-gray-50">
                <svg
                  width="400"
                  height="400"
                  className="border bg-white"
                  onClick={(e) => {
                    if (placingBattery) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = Math.floor((e.clientX - rect.left) / 40)
                      const y = Math.floor((e.clientY - rect.top) / 40)
                      handleGridClick(x, y)
                    }
                  }}
                  style={{ cursor: placingBattery ? 'crosshair' : 'default' }}
                >
                  {/* Grid lines */}
                  {Array.from({ length: 11 }, (_, i) => (
                    <g key={`grid-${i}`}>
                      <line
                        x1={i * 40}
                        y1={0}
                        x2={i * 40}
                        y2={400}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                      />
                      <line
                        x1={0}
                        y1={i * 40}
                        x2={400}
                        y2={i * 40}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                      />
                    </g>
                  ))}
                  
                  {/* Render all entities */}
                  {customers.map(renderEntity)}
                  {solarFarms.map(renderEntity)}
                  {gasPlants.map(renderEntity)}
                  {batteries.map(renderEntity)}
                  {playerBattery && renderEntity(playerBattery)}
                </svg>
                
                {placingBattery && (
                  <p className="text-sm text-gray-600 mt-2">
                    Click on an empty grid intersection to place your battery
                  </p>
                )}
              </div>
            </div>

            {/* Controls and Stats */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button onClick={handleStep} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Next Step
                </Button>
                <Button onClick={handleReset} variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Game
                </Button>
                {!playerBattery && (
                  <Button 
                    onClick={handleAddPlayerBattery} 
                    variant="outline" 
                    className="w-full"
                    disabled={placingBattery}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {placingBattery ? 'Click to Place' : 'Add Battery'}
                  </Button>
                )}
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Demand:</span>
                    <span className="font-mono">{totalDemand} MW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solar Output:</span>
                    <span className="font-mono">{totalSolar} MW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Battery Output:</span>
                    <span className="font-mono">{totalBatteryOutput + playerBatteryOutput} MW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Output:</span>
                    <span className="font-mono">{totalGas} MW</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>System Status:</span>
                    <span className={isDeficit ? "text-red-600" : "text-green-600"}>
                      {isDeficit ? "DEFICIT" : "BALANCED"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Entity Count</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Customers:</span>
                    <span>{customers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solar Farms:</span>
                    <span>{solarFarms.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Plants:</span>
                    <span>{gasPlants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NPC Batteries:</span>
                    <span>{batteries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Battery:</span>
                    <span>{playerBattery ? "1" : "0"}</span>
                  </div>
                </CardContent>
              </Card>

              {playerBattery && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Your Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-mono font-semibold">
                        ${playerRevenue.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="font-mono">
                        {playerBattery.currentStorage.toFixed(1)}/{playerBattery.maxStorage} MWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Output:</span>
                      <span className="font-mono">
                        {playerBattery.output.toFixed(1)} MW
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnergyGridGame