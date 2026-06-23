"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Droplets, Gauge, Waves, Cable,
  Calculator, History, AlertTriangle, CheckCircle2,
  X, RotateCcw, Download, BarChart3, FileJson,
} from "lucide-react";
import { buildCalcEngine } from "@/lib/calculations/engine";
import { logCalculation, getCalculationLogs, getCalculationStats } from "@/lib/calc-logger";
import { exportCalculationToCSV, exportCalculationToJSON } from "@/lib/calc-export";
import type {
  GeneratorInput, GeneratorOutput,
  DieselInput, DieselOutput,
  WaterDemandInput, WaterDemandOutput,
  PumpSizingInput, PumpSizingOutput,
  ElectricalLoadInput, ElectricalLoadOutput,
  CalculationType, CalcInput, CalcOutput,
  EngineResult, CalculationRecord,
} from "@/lib/calculations";

type CalcTab = "generator" | "diesel" | "water" | "pump" | "electrical";

const TAB_CONFIG: Record<CalcTab, { label: string; icon: React.ElementType; color: string }> = {
  generator: { label: "Generator Load", icon: Zap, color: "var(--color-primary)" },
  diesel:    { label: "Diesel Consumption", icon: Droplets, color: "var(--color-destructive)" },
  water:     { label: "Water Demand", icon: Waves, color: "var(--color-info)" },
  pump:      { label: "Pump Sizing", icon: Gauge, color: "#2A9D8F" },
  electrical:{ label: "Electrical Load", icon: Cable, color: "#F4A261" },
};

function ResultCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-card-alt rounded-xl border border-border p-4">
      <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">
        {value}
        {unit && <span className="text-sm font-normal text-text-muted ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function ErrorAlert({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-1">
      {errors.map((err, i) => (
        <p key={i} className="text-xs text-destructive flex items-start gap-2">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          {err}
        </p>
      ))}
    </div>
  );
}

function NumberInput({ label, value, onChange, error, placeholder, min, max, step }: {
  label: string; value: string; onChange: (v: string) => void; error?: string | null;
  placeholder?: string; min?: number; max?: number; step?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-tertiary mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full h-10 px-3 rounded-lg bg-card-alt border text-foreground text-sm outline-none placeholder:text-text-muted ${
          error ? "border-destructive" : "border-border focus:border-primary/50"
        }`}
      />
      {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
    </div>
  );
}

function toNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function toInt(v: string): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

function GeneratorTab() {
  const [ratedPowerKva, setRatedPowerKva] = useState("");
  const [powerFactor, setPowerFactor] = useState("0.8");
  const [loadFactorPercent, setLoadFactorPercent] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<EngineResult<GeneratorOutput> | null>(null);

  const handleCalculate = () => {
    const input: GeneratorInput = {
      ratedPowerKva: toNum(ratedPowerKva),
      powerFactor: toNum(powerFactor),
      loadFactorPercent: toNum(loadFactorPercent),
      hoursPerDay: toNum(hoursPerDay),
      daysPerWeek: toNum(daysPerWeek),
    };
    const engineResult = buildCalcEngine<GeneratorOutput>("generator", input);
    setResult(engineResult);
    setErrors(engineResult.errors);
    logCalculation("generator", input as unknown as Record<string, unknown>, engineResult);
  };

  const handleReset = () => {
    setRatedPowerKva(""); setPowerFactor("0.8"); setLoadFactorPercent("");
    setHoursPerDay("8"); setDaysPerWeek("5");
    setErrors([]); setResult(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NumberInput label="Generator Rated Power (kVA)" value={ratedPowerKva} onChange={setRatedPowerKva} min={0} step="1" placeholder="e.g. 150" />
        <NumberInput label="Power Factor (0.1\u20131.0)" value={powerFactor} onChange={setPowerFactor} min={0.1} max={1} step="0.01" placeholder="e.g. 0.8" />
        <NumberInput label="Load Factor (%)" value={loadFactorPercent} onChange={setLoadFactorPercent} min={0} max={100} step="1" placeholder="e.g. 75" />
        <NumberInput label="Hours per Day" value={hoursPerDay} onChange={setHoursPerDay} min={0} max={24} step="0.5" placeholder="e.g. 8" />
        <NumberInput label="Days per Week" value={daysPerWeek} onChange={setDaysPerWeek} min={0} max={7} step="1" placeholder="e.g. 5" />
      </div>
      <ErrorAlert errors={errors} />
      <div className="flex gap-3">
        <button onClick={handleCalculate} className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Calculator size={14} /> Calculate
        </button>
        <button onClick={handleReset} className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      {result?.success && result.data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <ResultCard label="Rated Power" value={result.data.ratedPowerKw} unit="kW" />
          <ResultCard label="Actual Load" value={result.data.actualLoadKw} unit="kW" />
          <ResultCard label="Daily Energy" value={result.data.dailyEnergyKwh} unit="kWh" />
          <ResultCard label="Weekly Energy" value={result.data.weeklyEnergyKwh} unit="kWh" />
          <ResultCard label="Monthly Energy" value={result.data.monthlyEnergyKwh} unit="kWh" />
          <ResultCard label="Utilization" value={result.data.utilizationPercent} unit="%" />
        </div>
      )}
    </div>
  );
}

function DieselTab() {
  const [generatorCapacityKva, setGeneratorCapacityKva] = useState("");
  const [loadFactorPercent, setLoadFactorPercent] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [sfc, setSfc] = useState("0.25");
  const [fuelPrice, setFuelPrice] = useState("1200");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<EngineResult<DieselOutput> | null>(null);

  const handleCalculate = () => {
    const input: DieselInput = {
      generatorCapacityKva: toNum(generatorCapacityKva),
      loadFactorPercent: toNum(loadFactorPercent),
      hoursPerDay: toNum(hoursPerDay),
      daysPerWeek: toNum(daysPerWeek),
      specificFuelConsumption: toNum(sfc),
      fuelPricePerLitre: toNum(fuelPrice),
    };
    const engineResult = buildCalcEngine<DieselOutput>("diesel", input);
    setResult(engineResult);
    setErrors(engineResult.errors);
    logCalculation("diesel", input as unknown as Record<string, unknown>, engineResult);
  };

  const handleReset = () => {
    setGeneratorCapacityKva(""); setLoadFactorPercent(""); setHoursPerDay("8"); setDaysPerWeek("5");
    setSfc("0.25"); setFuelPrice("1200");
    setErrors([]); setResult(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NumberInput label="Generator Capacity (kVA)" value={generatorCapacityKva} onChange={setGeneratorCapacityKva} min={0} step="1" placeholder="e.g. 150" />
        <NumberInput label="Load Factor (%)" value={loadFactorPercent} onChange={setLoadFactorPercent} min={0} max={100} step="1" placeholder="e.g. 75" />
        <NumberInput label="Hours per Day" value={hoursPerDay} onChange={setHoursPerDay} min={0} max={24} step="0.5" placeholder="e.g. 8" />
        <NumberInput label="Days per Week" value={daysPerWeek} onChange={setDaysPerWeek} min={0} max={7} step="1" placeholder="e.g. 5" />
        <NumberInput label="SFC (L/kWh)" value={sfc} onChange={setSfc} min={0.01} max={1} step="0.01" placeholder="e.g. 0.25" />
        <NumberInput label="Fuel Price per Litre (NGN)" value={fuelPrice} onChange={setFuelPrice} min={0} step="1" placeholder="e.g. 1200" />
      </div>
      <ErrorAlert errors={errors} />
      <div className="flex gap-3">
        <button onClick={handleCalculate} className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Calculator size={14} /> Calculate
        </button>
        <button onClick={handleReset} className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      {result?.success && result.data && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Consumption</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ResultCard label="Daily" value={`${Math.round(result.data.dailyConsumptionLitres)}`} unit="L" />
            <ResultCard label="Weekly" value={`${Math.round(result.data.weeklyConsumptionLitres)}`} unit="L" />
            <ResultCard label="Monthly" value={`${Math.round(result.data.monthlyConsumptionLitres)}`} unit="L" />
            <ResultCard label="Annual" value={`${Math.round(result.data.annualConsumptionLitres)}`} unit="L" />
          </div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Cost</p>
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Monthly Cost" value={Math.round(result.data.monthlyCost).toLocaleString()} unit="NGN" />
            <ResultCard label="Annual Cost" value={Math.round(result.data.annualCost).toLocaleString()} unit="NGN" />
          </div>
        </div>
      )}
    </div>
  );
}

function WaterTab() {
  const [numberOfOccupants, setNumberOfOccupants] = useState("");
  const [consumptionPerCapita, setConsumptionPerCapita] = useState("150");
  const [daysPerWeek, setDaysPerWeek] = useState("7");
  const [peakFactor, setPeakFactor] = useState("1.5");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<EngineResult<WaterDemandOutput> | null>(null);

  const handleCalculate = () => {
    const input: WaterDemandInput = {
      numberOfOccupants: toInt(numberOfOccupants),
      dailyConsumptionPerCapitaLitres: toNum(consumptionPerCapita),
      daysPerWeek: toInt(daysPerWeek),
      peakFactor: toNum(peakFactor),
    };
    const engineResult = buildCalcEngine<WaterDemandOutput>("water", input);
    setResult(engineResult);
    setErrors(engineResult.errors);
    logCalculation("water", input as unknown as Record<string, unknown>, engineResult);
  };

  const handleReset = () => {
    setNumberOfOccupants(""); setConsumptionPerCapita("150"); setDaysPerWeek("7"); setPeakFactor("1.5");
    setErrors([]); setResult(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NumberInput label="Number of Occupants" value={numberOfOccupants} onChange={setNumberOfOccupants} min={1} step="1" placeholder="e.g. 200" />
        <NumberInput label="Consumption per Capita (L/day)" value={consumptionPerCapita} onChange={setConsumptionPerCapita} min={1} step="1" placeholder="e.g. 150" />
        <NumberInput label="Days per Week" value={daysPerWeek} onChange={setDaysPerWeek} min={1} max={7} step="1" placeholder="e.g. 7" />
        <NumberInput label="Peak Factor" value={peakFactor} onChange={setPeakFactor} min={1} step="0.1" placeholder="e.g. 1.5" />
      </div>
      <ErrorAlert errors={errors} />
      <div className="flex gap-3">
        <button onClick={handleCalculate} className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Calculator size={14} /> Calculate
        </button>
        <button onClick={handleReset} className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      {result?.success && result.data && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Demand</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ResultCard label="Avg Daily" value={`${Math.round(result.data.averageDailyDemandLitres)}`} unit="L" />
            <ResultCard label="Peak Daily" value={`${Math.round(result.data.peakDailyDemandLitres)}`} unit="L" />
            <ResultCard label="Weekly" value={`${Math.round(result.data.weeklyDemandLitres)}`} unit="L" />
            <ResultCard label="Monthly" value={`${Math.round(result.data.monthlyDemandLitres)}`} unit="L" />
          </div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">In Cubic Metres</p>
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Avg Daily" value={result.data.averageDailyDemandM3} unit="m\u00B3" />
            <ResultCard label="Peak Daily" value={result.data.peakDailyDemandM3} unit="m\u00B3" />
          </div>
        </div>
      )}
    </div>
  );
}

function PumpTab() {
  const [flowRate, setFlowRate] = useState("");
  const [head, setHead] = useState("");
  const [density, setDensity] = useState("1000");
  const [efficiency, setEfficiency] = useState("75");
  const [safetyFactor, setSafetyFactor] = useState("10");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<EngineResult<PumpSizingOutput> | null>(null);

  const handleCalculate = () => {
    const input: PumpSizingInput = {
      flowRateRequiredM3H: toNum(flowRate),
      totalDynamicHeadM: toNum(head),
      fluidDensityKgM3: toNum(density),
      pumpEfficiencyPercent: toNum(efficiency),
      motorSafetyFactorPercent: toNum(safetyFactor),
    };
    const engineResult = buildCalcEngine<PumpSizingOutput>("pump", input);
    setResult(engineResult);
    setErrors(engineResult.errors);
    logCalculation("pump", input as unknown as Record<string, unknown>, engineResult);
  };

  const handleReset = () => {
    setFlowRate(""); setHead(""); setDensity("1000"); setEfficiency("75"); setSafetyFactor("10");
    setErrors([]); setResult(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NumberInput label="Flow Rate Required (m\u00B3/h)" value={flowRate} onChange={setFlowRate} min={0} step="0.1" placeholder="e.g. 50" />
        <NumberInput label="Total Dynamic Head (m)" value={head} onChange={setHead} min={0} step="0.1" placeholder="e.g. 30" />
        <NumberInput label="Fluid Density (kg/m\u00B3)" value={density} onChange={setDensity} min={0} step="1" placeholder="e.g. 1000" />
        <NumberInput label="Pump Efficiency (%)" value={efficiency} onChange={setEfficiency} min={1} max={100} step="1" placeholder="e.g. 75" />
        <NumberInput label="Motor Safety Factor (%)" value={safetyFactor} onChange={setSafetyFactor} min={0} step="1" placeholder="e.g. 10" />
      </div>
      <ErrorAlert errors={errors} />
      <div className="flex gap-3">
        <button onClick={handleCalculate} className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Calculator size={14} /> Calculate
        </button>
        <button onClick={handleReset} className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      {result?.success && result.data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <ResultCard label="Flow Rate" value={result.data.flowRateLS} unit="L/s" />
          <ResultCard label="Hydraulic Power" value={result.data.hydraulicPowerKw} unit="kW" />
          <ResultCard label="Shaft Power" value={result.data.shaftPowerKw} unit="kW" />
          <ResultCard label="Motor Power" value={result.data.motorPowerKw} unit="kW" />
          <ResultCard label="Recommended Motor" value={result.data.recommendedMotorPowerKw} unit="kW" />
        </div>
      )}
    </div>
  );
}

function ElectricalTab() {
  const [loads, setLoads] = useState<{ description: string; quantity: string; wattage: string; hours: string; days: string }[]>([
    { description: "", quantity: "", wattage: "", hours: "", days: "" },
  ]);
  const [diversityFactor, setDiversityFactor] = useState("80");
  const [expansionFactor, setExpansionFactor] = useState("15");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<EngineResult<ElectricalLoadOutput> | null>(null);

  const addLoad = () => setLoads((p) => [...p, { description: "", quantity: "", wattage: "", hours: "", days: "" }]);
  const removeLoad = (i: number) => { if (loads.length > 1) setLoads((p) => p.filter((_, idx) => idx !== i)); };
  const updateLoad = (i: number, key: string, value: string) => setLoads((p) => p.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));

  const handleCalculate = () => {
    const input: ElectricalLoadInput = {
      loads: loads.map((l) => ({
        description: l.description,
        quantity: toInt(l.quantity),
        wattagePerUnit: toNum(l.wattage),
        usageHoursPerDay: toNum(l.hours),
        daysPerWeek: toNum(l.days),
      })),
      diversityFactorPercent: toNum(diversityFactor),
      futureExpansionPercent: toNum(expansionFactor),
    };
    const engineResult = buildCalcEngine<ElectricalLoadOutput>("electrical", input);
    setResult(engineResult);
    setErrors(engineResult.errors);
    logCalculation("electrical", input as unknown as Record<string, unknown>, engineResult);
  };

  const handleReset = () => {
    setLoads([{ description: "", quantity: "", wattage: "", hours: "", days: "" }]);
    setDiversityFactor("80"); setExpansionFactor("15");
    setErrors([]); setResult(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput label="Diversity Factor (%)" value={diversityFactor} onChange={setDiversityFactor} min={1} max={100} step="1" placeholder="e.g. 80" />
        <NumberInput label="Future Expansion (%)" value={expansionFactor} onChange={setExpansionFactor} min={0} step="1" placeholder="e.g. 15" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Load Items</p>
          <button onClick={addLoad} className="h-7 px-3 rounded-lg bg-card-alt border border-border text-[10px] text-foreground hover:bg-accent transition-colors">
            + Add Load
          </button>
        </div>
        {loads.map((load, i) => (
          <div key={i} className="grid grid-cols-5 sm:grid-cols-6 gap-2 items-end">
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-[10px] text-text-tertiary mb-1">Description</label>
              <input type="text" value={load.description} onChange={(e) => updateLoad(i, "description", e.target.value)}
                placeholder="e.g. Lighting" className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-xs text-foreground outline-none placeholder:text-text-muted"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-tertiary mb-1">Qty</label>
              <input type="number" value={load.quantity} onChange={(e) => updateLoad(i, "quantity", e.target.value)}
                min={1} className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-xs text-foreground outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-tertiary mb-1">Watts</label>
              <input type="number" value={load.wattage} onChange={(e) => updateLoad(i, "wattage", e.target.value)}
                min={1} className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-xs text-foreground outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-tertiary mb-1">Hrs</label>
              <input type="number" value={load.hours} onChange={(e) => updateLoad(i, "hours", e.target.value)}
                min={0} max={24} className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-xs text-foreground outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-tertiary mb-1">Days</label>
              <div className="flex items-center gap-1">
                <input type="number" value={load.days} onChange={(e) => updateLoad(i, "days", e.target.value)}
                  min={0} max={7} className="w-full h-9 px-2 rounded-lg bg-card-alt border border-border text-xs text-foreground outline-none"
                />
                {loads.length > 1 && (
                  <button onClick={() => removeLoad(i)} className="h-9 w-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ErrorAlert errors={errors} />
      <div className="flex gap-3">
        <button onClick={handleCalculate} className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Calculator size={14} /> Calculate
        </button>
        <button onClick={handleReset} className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {result?.success && result.data && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <ResultCard label="Installed Load" value={result.data.totalInstalledLoadW.toLocaleString()} unit="W" />
            <ResultCard label="Installed Load" value={result.data.totalInstalledLoadKw} unit="kW" />
            <ResultCard label="Diversified Load" value={result.data.diversifiedLoadKw} unit="kW" />
            <ResultCard label="Future Load" value={result.data.futureLoadKw} unit="kW" />
            <ResultCard label="Daily Energy" value={result.data.dailyEnergyKwh} unit="kWh" />
            <ResultCard label="Monthly Energy" value={result.data.monthlyEnergyKwh} unit="kWh" />
          </div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Per Load Item</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-text-tertiary">
                  <th className="text-left py-2 pr-2 font-medium">Description</th>
                  <th className="text-right py-2 px-2 font-medium">Qty</th>
                  <th className="text-right py-2 px-2 font-medium">W/Unit</th>
                  <th className="text-right py-2 px-2 font-medium">Total W</th>
                  <th className="text-right py-2 px-2 font-medium">Total kW</th>
                  <th className="text-right py-2 px-2 font-medium">Daily kWh</th>
                  <th className="text-right py-2 pl-2 font-medium">Weekly kWh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.data.loads.map((l, i) => (
                  <tr key={i} className="text-foreground">
                    <td className="py-2 pr-2">{l.description}</td>
                    <td className="text-right py-2 px-2">{l.quantity}</td>
                    <td className="text-right py-2 px-2">{l.wattagePerUnit}</td>
                    <td className="text-right py-2 px-2">{l.totalWatts.toLocaleString()}</td>
                    <td className="text-right py-2 px-2">{l.totalKw}</td>
                    <td className="text-right py-2 px-2">{l.dailyKwh}</td>
                    <td className="text-right py-2 pl-2">{l.weeklyKwh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FMCalculatorPage() {
  const [tab, setTab] = useState<CalcTab>("generator");
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [logs, setLogs] = useState<CalculationRecord[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getCalculationStats> | null>(null);

  const openHistory = useCallback(() => {
    setLogs(getCalculationLogs({ limit: 50 }));
    setShowHistory(true);
  }, []);

  const openStats = useCallback(() => {
    setStats(getCalculationStats());
    setShowStats(true);
  }, []);

  const tabs: CalcTab[] = ["generator", "diesel", "water", "pump", "electrical"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FM Calculator</h1>
          <p className="text-text-tertiary text-sm mt-1">
            Facility Management engineering calculations — generator load, diesel consumption, water demand, pump sizing, electrical load
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openStats}
            className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2"
          >
            <BarChart3 size={14} /> Analytics
          </button>
          <button onClick={openHistory}
            className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2"
          >
            <History size={14} /> History
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 pb-1">
        {tabs.map((t) => {
          const cfg = TAB_CONFIG[t];
          const Icon = cfg.icon;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card-alt border border-border text-foreground hover:bg-accent"
              }`}
            >
              <Icon size={14} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        {tab === "generator" && <GeneratorTab />}
        {tab === "diesel" && <DieselTab />}
        {tab === "water" && <WaterTab />}
        {tab === "pump" && <PumpTab />}
        {tab === "electrical" && <ElectricalTab />}
      </motion.div>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60 flex items-center justify-center p-4"
            onClick={() => setShowStats(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card rounded-2xl border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Calculation Analytics</h2>
                <button onClick={() => setShowStats(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-foreground/5 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {stats && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-card-alt rounded-xl p-3 text-center border border-border">
                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        <p className="text-[10px] text-text-tertiary">Total</p>
                      </div>
                      <div className="bg-card-alt rounded-xl p-3 text-center border border-border">
                        <p className="text-2xl font-bold text-success">{stats.success}</p>
                        <p className="text-[10px] text-text-tertiary">Success</p>
                      </div>
                      <div className="bg-card-alt rounded-xl p-3 text-center border border-border">
                        <p className="text-2xl font-bold text-destructive">{stats.error}</p>
                        <p className="text-[10px] text-text-tertiary">Errors</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">By Calculator</p>
                      {(["generator", "diesel", "water", "pump", "electrical"] as CalcTab[]).map((t) => {
                        const cfg = TAB_CONFIG[t];
                        return (
                          <div key={t} className="flex items-center justify-between bg-card-alt rounded-lg px-3 py-2 border border-border">
                            <span className="text-xs text-foreground">{cfg.label}</span>
                            <span className="text-xs font-bold text-foreground">{stats.byType[t]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60 flex items-start justify-end"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg h-full bg-card border-l border-border overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-foreground">Calculation History</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { const l = getCalculationLogs({ limit: 50 }); exportCalculationToCSV(l); }}
                    className="h-8 px-3 rounded-lg bg-card-alt border border-border text-[10px] text-foreground hover:bg-accent transition-colors flex items-center gap-1"
                    title="Export CSV"
                  >
                    <Download size={12} /> CSV
                  </button>
                  <button onClick={() => { const l = getCalculationLogs({ limit: 50 }); exportCalculationToJSON(l); }}
                    className="h-8 px-3 rounded-lg bg-card-alt border border-border text-[10px] text-foreground hover:bg-accent transition-colors flex items-center gap-1"
                    title="Export JSON"
                  >
                    <FileJson size={12} /> JSON
                  </button>
                  <button onClick={() => setShowHistory(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-foreground/5 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {logs.length === 0 ? (
                  <p className="text-center text-text-tertiary text-sm py-8">No calculations logged yet</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="bg-card-alt rounded-xl border border-border p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                          {log.status === "success" ? (
                            <CheckCircle2 size={12} className="text-success" />
                          ) : (
                            <AlertTriangle size={12} className="text-destructive" />
                          )}
                          {TAB_CONFIG[log.type as CalcTab]?.label || log.type}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {log.status === "error" && log.errorMessage && (
                        <p className="text-[10px] text-destructive">{log.errorMessage}</p>
                      )}
                      {log.status === "success" && log.outputs && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(log.outputs).slice(0, 5).map(([key, val]) => (
                            <span key={key} className="text-[9px] bg-card rounded px-1.5 py-0.5 border border-border text-text-muted">
                              {key}: {typeof val === "number" ? Math.round(val * 100) / 100 : String(val).slice(0, 20)}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[9px] text-text-muted font-mono">
                        {log.id} &middot; {log.user}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
