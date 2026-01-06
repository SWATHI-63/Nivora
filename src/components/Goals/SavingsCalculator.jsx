import React, { useState } from 'react';
import './SavingsCalculator.css';

function SavingsCalculator() {
  const [calculatorType, setCalculatorType] = useState('simple');
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('7');
  const [time, setTime] = useState('5');
  const [frequency, setFrequency] = useState('yearly');
  const [monthlyDeposit, setMonthlyDeposit] = useState('1000');

  const calculateSimpleInterest = () => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) / 100 || 0;
    const t = parseFloat(time) || 0;
    const interest = p * r * t;
    const total = p + interest;
    return { principal: p, interest, total };
  };

  const calculateCompoundInterest = () => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) / 100 || 0;
    const t = parseFloat(time) || 0;
    
    let n = 1; // compound frequency per year
    if (frequency === 'monthly') n = 12;
    else if (frequency === 'quarterly') n = 4;
    else if (frequency === 'half-yearly') n = 2;
    
    const amount = p * Math.pow((1 + r / n), n * t);
    const interest = amount - p;
    return { principal: p, interest, total: amount };
  };

  const calculateSIP = () => {
    const monthlyAmount = parseFloat(monthlyDeposit) || 0;
    const annualRate = parseFloat(rate) / 100 || 0;
    const monthlyRate = annualRate / 12;
    const months = parseFloat(time) * 12 || 0;
    
    // Future Value of SIP: FV = P × [(1 + r)^n - 1] / r × (1 + r)
    const futureValue = monthlyAmount * 
      (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * 
      (1 + monthlyRate);
    
    const totalInvested = monthlyAmount * months;
    const returns = futureValue - totalInvested;
    
    return { 
      principal: totalInvested, 
      interest: returns, 
      total: futureValue 
    };
  };

  const calculateSavingsTarget = () => {
    const target = parseFloat(principal) || 0;
    const annualRate = parseFloat(rate) / 100 || 0;
    const monthlyRate = annualRate / 12;
    const years = parseFloat(time) || 0;
    const months = years * 12;
    
    // PMT = FV × r / [(1 + r)^n - 1]
    const monthlyRequired = target * monthlyRate / 
      (Math.pow(1 + monthlyRate, months) - 1);
    
    return {
      targetAmount: target,
      monthlyRequired: monthlyRequired,
      totalMonths: months,
      years: years
    };
  };

  const result = calculatorType === 'simple' ? calculateSimpleInterest() :
                 calculatorType === 'compound' ? calculateCompoundInterest() :
                 calculatorType === 'sip' ? calculateSIP() : null;

  const targetResult = calculatorType === 'target' ? calculateSavingsTarget() : null;

  const getSavingSuggestions = () => {
    const suggestions = [];
    const years = parseFloat(time) || 1;
    
    if (calculatorType === 'sip' || calculatorType === 'compound') {
      const monthly = parseFloat(monthlyDeposit) || parseFloat(principal) / (years * 12);
      
      suggestions.push({
        icon: '☕',
        title: 'Skip the daily coffee',
        description: `Save ₹150/day = ₹4,500/month`,
        impact: 4500
      });
      
      suggestions.push({
        icon: '🍔',
        title: 'Cook at home more often',
        description: `Save ₹2,000/month on dining out`,
        impact: 2000
      });
      
      suggestions.push({
        icon: '🎬',
        title: 'Reduce entertainment expenses',
        description: `Save ₹1,500/month on subscriptions`,
        impact: 1500
      });
      
      suggestions.push({
        icon: '🚗',
        title: 'Use public transport',
        description: `Save ₹2,500/month on fuel`,
        impact: 2500
      });
    }
    
    return suggestions;
  };

  return (
    <div className="savings-calculator-container">
      <div className="calculator-header">
        <h2>💰 Savings & Interest Calculator</h2>
        <p>Plan your financial future with smart calculations</p>
      </div>

      <div className="calculator-types">
        <button
          className={`calc-type-btn ${calculatorType === 'simple' ? 'active' : ''}`}
          onClick={() => setCalculatorType('simple')}
        >
          <span>📊</span>
          Simple Interest
        </button>
        <button
          className={`calc-type-btn ${calculatorType === 'compound' ? 'active' : ''}`}
          onClick={() => setCalculatorType('compound')}
        >
          <span>📈</span>
          Compound Interest
        </button>
        <button
          className={`calc-type-btn ${calculatorType === 'sip' ? 'active' : ''}`}
          onClick={() => setCalculatorType('sip')}
        >
          <span>💎</span>
          SIP Calculator
        </button>
        <button
          className={`calc-type-btn ${calculatorType === 'target' ? 'active' : ''}`}
          onClick={() => setCalculatorType('target')}
        >
          <span>🎯</span>
          Target Savings
        </button>
      </div>

      <div className="calculator-form">
        {calculatorType === 'target' ? (
          <>
            <div className="form-group">
              <label>Target Amount (₹)</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="100000"
              />
            </div>
            <div className="form-group">
              <label>Time Period (Years)</label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="5"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label>Expected Annual Return (%)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="7"
                step="0.1"
              />
            </div>
          </>
        ) : calculatorType === 'sip' ? (
          <>
            <div className="form-group">
              <label>Monthly Investment (₹)</label>
              <input
                type="number"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(e.target.value)}
                placeholder="5000"
              />
            </div>
            <div className="form-group">
              <label>Time Period (Years)</label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label>Expected Annual Return (%)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="12"
                step="0.1"
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Principal Amount (₹)</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="100000"
              />
            </div>
            <div className="form-group">
              <label>Annual Interest Rate (%)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="7"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Time Period (Years)</label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="5"
                step="0.5"
              />
            </div>
            {calculatorType === 'compound' && (
              <div className="form-group">
                <label>Compounding Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="yearly">Yearly</option>
                  <option value="half-yearly">Half-Yearly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>

      {result && (
        <div className="calculator-result">
          <h3>💡 Results</h3>
          <div className="result-cards">
            <div className="result-card">
              <div className="result-label">
                {calculatorType === 'sip' ? 'Total Invested' : 'Principal Amount'}
              </div>
              <div className="result-value">₹{result.principal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="result-card">
              <div className="result-label">
                {calculatorType === 'sip' ? 'Returns' : 'Interest Earned'}
              </div>
              <div className="result-value success">₹{result.interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="result-card highlight">
              <div className="result-label">
                {calculatorType === 'sip' ? 'Maturity Value' : 'Total Amount'}
              </div>
              <div className="result-value">₹{result.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
        </div>
      )}

      {targetResult && (
        <div className="calculator-result">
          <h3>🎯 Monthly Savings Required</h3>
          <div className="result-cards">
            <div className="result-card highlight">
              <div className="result-label">Save Each Month</div>
              <div className="result-value">₹{targetResult.monthlyRequired.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Time Period</div>
              <div className="result-value">{targetResult.years} years ({targetResult.totalMonths} months)</div>
            </div>
            <div className="result-card">
              <div className="result-label">Target Amount</div>
              <div className="result-value success">₹{targetResult.targetAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
        </div>
      )}

      <div className="savings-suggestions">
        <h3>💡 Automatic Savings Suggestions</h3>
        <p className="suggestions-subtitle">Small changes can make a big difference</p>
        <div className="suggestions-grid">
          {getSavingSuggestions().map((suggestion, index) => (
            <div key={index} className="suggestion-card">
              <div className="suggestion-icon">{suggestion.icon}</div>
              <div className="suggestion-content">
                <h4>{suggestion.title}</h4>
                <p>{suggestion.description}</p>
                <div className="suggestion-impact">
                  Potential yearly savings: <strong>₹{(suggestion.impact * 12).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SavingsCalculator;
