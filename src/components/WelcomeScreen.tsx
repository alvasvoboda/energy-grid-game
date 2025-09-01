import React from 'react'
import { Zap, Battery, TrendingUp, Play, HelpCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface WelcomeScreenProps {
  onStart: () => void
  onShowHelp: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onShowHelp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-6 shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Energy Grid Trading Game
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master electricity markets and battery storage economics through interactive simulation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Battery className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-blue-900">Manage Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-800 text-center">
                Place and operate your battery to store cheap energy and sell when prices are high
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 hover:bg-green-50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-green-900">Earn Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-800 text-center">
                Make $100/MWh selling power during shortages, pay $20/MWh when charging
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-purple-900">Learn Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-800 text-center">
                Understand real electricity market dynamics, dispatch order, and grid operations
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Trading
          </Button>
          
          <div>
            <Button 
              onClick={onShowHelp}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              How to Play
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Educational simulation • Simplified electricity market mechanics</p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen