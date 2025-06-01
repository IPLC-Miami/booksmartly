import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function LabResultSummary() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const labData = [
    {
      test: "Creatinine",
      value: 5.17,
      unit: "mg/dL",
      refLower: null,
      refUpper: 1.2,
      refOperator: "<",
      status: "Higher than usual",
      category: "kidney"
    },
    {
      test: "Estimated GFR",
      value: 13,
      unit: "mL/min/1.73m²",
      refLower: 59,
      refUpper: null,
      refOperator: ">",
      status: "Lower than usual",
      category: "kidney"
    },
    {
      test: "Urea",
      value: 81,
      unit: "mg/dL",
      refLower: 19,
      refUpper: 44,
      refOperator: "range",
      status: "Higher than usual",
      category: "kidney"
    },
    {
      test: "Urea Nitrogen (BUN)",
      value: 37.83,
      unit: "mg/dL",
      refLower: 8.9,
      refUpper: 20.6,
      refOperator: "range",
      status: "Higher than usual",
      category: "kidney"
    },
    {
      test: "Uric Acid",
      value: 3.8,
      unit: "mg/dL",
      refLower: 3.4,
      refUpper: 7,
      refOperator: "range",
      status: "Within normal range",
      category: "kidney"
    },
    {
      test: "AST (GOT)",
      value: 20,
      unit: "U/L",
      refLower: null,
      refUpper: 40,
      refOperator: "<",
      status: "Within normal range",
      category: "liver"
    },
    {
      test: "ALT (SGPT)",
      value: 18,
      unit: "U/L",
      refLower: null,
      refUpper: 41,
      refOperator: "<",
      status: "Within normal range",
      category: "liver"
    },
    {
      test: "GGT",
      value: 22,
      unit: "U/L",
      refLower: null,
      refUpper: 71,
      refOperator: "<",
      status: "Within normal range",
      category: "liver"
    },
    {
      test: "Alkaline Phosphatase",
      value: 182,
      unit: "U/L",
      refLower: null,
      refUpper: 128,
      refOperator: "<",
      status: "Higher than usual",
      category: "liver"
    },
    {
      test: "Total Bilirubin",
      value: 0.34,
      unit: "mg/dL",
      refLower: null,
      refUpper: 1.1,
      refOperator: "<",
      status: "Within normal range",
      category: "liver"
    },
    {
      test: "Direct Bilirubin",
      value: 0.16,
      unit: "mg/dL",
      refLower: null,
      refUpper: 0.2,
      refOperator: "<",
      status: "Within normal range",
      category: "liver"
    },
    {
      test: "Indirect Bilirubin",
      value: 0.18,
      unit: "mg/dL",
      refLower: null,
      refUpper: 1.1,
      refOperator: "<",
      status: "Within normal range",
      category: "liver"
    },
    {
      test: "Total Protein",
      value: 6.46,
      unit: "g/dL",
      refLower: 6.4,
      refUpper: 8.3,
      refOperator: "range",
      status: "Within normal range",
      category: "protein"
    },
    {
      test: "Albumin",
      value: 3.83,
      unit: "g/dL",
      refLower: 3.97,
      refUpper: 4.94,
      refOperator: "range",
      status: "Lower than usual",
      category: "protein"
    },
    {
      test: "A:G Ratio",
      value: 1.46,
      unit: "",
      refLower: 0.9,
      refUpper: 2,
      refOperator: "range",
      status: "Within normal range",
      category: "protein"
    },
    {
      test: "Globulin (Calculated)",
      value: 2.63,
      unit: "g/dL",
      refLower: 2,
      refUpper: 3.5,
      refOperator: "range",
      status: "Within normal range",
      category: "protein"
    }
  ];

  // Filter data based on active category
  const filteredData = activeCategory === 'all' 
    ? labData 
    : labData.filter(item => item.category === activeCategory);

  // Calculate percentage for visualization
  const prepareChartData = () => {
    return filteredData.map(item => {
      // Set up references based on the reference operator
      let refValue, percentOfRef;
      
      if (item.refOperator === "range") {
        const midpoint = (item.refUpper + item.refLower) / 2;
        const range = item.refUpper - item.refLower;
        
        // Calculate how far from midpoint as percentage of half the range
        percentOfRef = ((item.value - midpoint) / (range / 2)) * 100;
        refValue = 0; // Midpoint is our reference (0%)
      } else if (item.refOperator === "<") {
        // For upper limit only
        percentOfRef = (item.value / item.refUpper) * 100;
        refValue = 100;
      } else if (item.refOperator === ">") {
        // For lower limit only
        percentOfRef = (item.value / item.refLower) * 100;
        refValue = 100;
      }
      
      return {
        ...item,
        percentOfRef,
        refValue,
        // Determine color based on status
        color: item.status === "Within normal range" ? "#22c55e" : 
               item.status === "Higher than usual" ? "#ef4444" : "#f97316"
      };
    });
  };
  
  const chartData = prepareChartData();
  
  // Group tests by status
  const abnormalTests = labData.filter(test => test.status !== "Within normal range");
  const normalTests = labData.filter(test => test.status === "Within normal range");

  // Status counts
  const statusCounts = {
    abnormal: abnormalTests.length,
    normal: normalTests.length,
    total: labData.length
  };

  // Determine severity based on number of abnormal results
  const getSeverityLabel = () => {
    const abnormalPercentage = (abnormalTests.length / labData.length) * 100;
    if (abnormalPercentage > 30) return "Significant abnormalities detected";
    if (abnormalPercentage > 15) return "Some abnormal results detected";
    return "Mostly normal results";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 mt-12">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Lab Results Dashboard</h1>
          <p className="text-gray-600">Patient ID: 12345 • Collected: Apr 10, 2025 • Reported: Apr 12, 2025</p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Results Summary</h2>
              <p className="text-lg font-medium text-gray-700">{getSeverityLabel()}</p>
            </div>
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{statusCounts.abnormal}</div>
                <div className="text-sm text-gray-500">Abnormal</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{statusCounts.normal}</div>
                <div className="text-sm text-gray-500">Normal</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{statusCounts.total}</div>
                <div className="text-sm text-gray-500">Total Tests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-md ${activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              All Tests
            </button>
            <button 
              onClick={() => setActiveCategory('kidney')}
              className={`px-4 py-2 rounded-md ${activeCategory === 'kidney' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Kidney Function
            </button>
            <button 
              onClick={() => setActiveCategory('liver')}
              className={`px-4 py-2 rounded-md ${activeCategory === 'liver' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Liver Function
            </button>
            <button 
              onClick={() => setActiveCategory('protein')}
              className={`px-4 py-2 rounded-md ${activeCategory === 'protein' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Protein Metabolism
            </button>
          </div>
        </div>

        {/* Visualization and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Visual Reference Chart</h2>
            <p className="text-sm text-gray-500 mb-4">
              This chart shows how each test result compares to its reference range. Bars extending to the right indicate higher values, while bars to the left indicate lower values.
            </p>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[-200, 300]} 
                    ticks={[-200, -100, 0, 100, 200, 300]} 
                    label={{ value: 'Percentage of Reference Range', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    dataKey="test" 
                    type="category" 
                    tick={{ fontSize: 12 }} 
                  />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const item = props.payload;
                      if (name === 'Result') {
                        return [`${item.value} ${item.unit}`, name];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Test: ${label}`}
                  />
                  <Legend />
                  <ReferenceLine x={0} stroke="#666" />
                  <ReferenceLine x={100} stroke="#666" strokeDasharray="3 3" />
                  <ReferenceLine x={-100} stroke="#666" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="percentOfRef" 
                    name="Result" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    dot={{ fill: (entry) => entry.color, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column - Tables */}
          <div className="space-y-6">
            {/* Abnormal Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-500 mr-2" size={20} />
                <h2 className="text-xl font-semibold text-gray-900">Abnormal Results</h2>
              </div>
              {abnormalTests.length > 0 ? (
                <div className="space-y-4">
                  {abnormalTests.map((test, index) => (
                    <div key={index} className="p-3 rounded-md bg-red-50 border border-red-100">
                      <div className="flex justify-between">
                        <span className="font-medium">{test.test}</span>
                        <span className={test.status === "Higher than usual" ? "text-red-600 font-bold" : "text-orange-600 font-bold"}>
                          {test.value} {test.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Reference: {test.refOperator === "range" 
                          ? `${test.refLower} - ${test.refUpper}` 
                          : test.refOperator === "<" 
                            ? `< ${test.refUpper}` 
                            : `> ${test.refLower}`} {test.unit}
                      </div>
                      <div className="text-sm font-medium mt-1">
                        Status: {test.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No abnormal results in this category.</p>
              )}
            </div>

            {/* Normal Results Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <h2 className="text-xl font-semibold text-gray-900">Normal Results</h2>
              </div>
              <div className="space-y-2">
                {normalTests.filter(test => activeCategory === 'all' || test.category === activeCategory)
                  .map((test, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-800">{test.test}</span>
                      <span className="text-green-600 font-medium">{test.value} {test.unit}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table View of All Results */}
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-900 p-6 pb-3">Complete Results Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((test, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.test}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{test.value} {test.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.refOperator === "range" 
                        ? `${test.refLower} - ${test.refUpper}` 
                        : test.refOperator === "<" 
                          ? `< ${test.refUpper}` 
                          : `> ${test.refLower}`} {test.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        test.status === "Within normal range" 
                          ? "bg-green-100 text-green-800" 
                          : test.status === "Higher than usual" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-orange-100 text-orange-800"
                      }`}>
                        {test.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            This report is for clinical evaluation purposes only. Please consult with a healthcare professional for interpretation.
          </p>
        </div>
      </footer>
    </div>
  );
}

