import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Form state
  const [formData, setFormData] = useState({
    selectedWork: 'Půdorys', // Typ práce
    totalArea: '', // Rozloha
    repairType: '', // Typ opravy
    furnitureMoving: '', // Posun nábytku
    material: '', // Materiál
    name: '',
    phone: '',
    email: '',
    address: '',
    rooms: '',
    ceilingHeight: '',
    spaceType: 'Pokoj',
    emptySpace: '',
    carpets: '',
    date: '',
    additionalInfo: ''
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Get button class and text based on state
  const getButtonClass = () => {
    if (isSubmitted) return 'order-button order-button-success';
    if (isSubmitting) return 'order-button order-button-submitting';
    if (isOrderEnabled) return 'order-button order-button-active';
    return 'order-button order-button-disabled';
  };

  const getButtonText = () => {
    if (isSubmitted) return '👍 ODESLÁNO';
    if (isSubmitting) return 'ODESÍLÁM';
    return 'OBJEDNAT';
  };

  // Update price calculation
  useEffect(() => {
    updatePrice();
  }, [formData.selectedWork, formData.totalArea, formData.repairType, formData.furnitureMoving, formData.material]);

  const updatePrice = () => {
    let basePrice = 0;
    let calculatedPrice = 0;

    const area = Number(formData.totalArea) || 0;

    if (area > 0) {
      // Výpočet základní ceny
      if (formData.selectedWork === "Půdorys") {
        basePrice = area > 20 ? 3000 + (area - 20) * 140 : 3000;
      } else if (formData.selectedWork === "Stěna") {
        basePrice = area > 80 ? 3000 + (area - 80) * 40 : 3000;
      }

      calculatedPrice = basePrice;

      // Přidání dalších nákladů
      if (formData.repairType === "Malé") calculatedPrice += basePrice * 0.17;
      if (formData.repairType === "Střední") calculatedPrice += basePrice * 0.35;
      if (formData.repairType === "Velké") calculatedPrice += basePrice * 0.80;
      if (formData.material === "Ano") calculatedPrice += basePrice * 0.20;
      if (formData.furnitureMoving === "Ano") calculatedPrice += basePrice * 0.12;

      // Příplatek za úklid (vždy)
      calculatedPrice += basePrice * 0.20;

      // Zaokrouhlení
      calculatedPrice = Math.round(calculatedPrice);
    }

    setTotalPrice(calculatedPrice);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validace
    if (!formData.email || formData.email.trim() === '') {
      setSubmitMessage('Prosím, zadejte platný e-mail.');
      return;
    }

    if (!formData.phone || formData.phone.trim() === '') {
      setSubmitMessage('Prosím, zadejte telefonní číslo.');
      return;
    }

    setIsSubmitting(true);
    setIsSubmitted(false);
    setSubmitMessage('');

    try {
      // Simulace odeslání (zde by byla API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      setSubmitMessage('Poptávka odeslána!');
      console.log('Form submitted:', { ...formData, calculatedPrice: totalPrice });
    } catch (error) {
      setSubmitMessage('Chyba při odesílání. Zkuste to znovu.');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-400 via-slate-500 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-panel text-center py-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Cena a termín
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Spočítejte si sami cenu a určete termín startu realizace zakázky. Ceny jsou přibližné. 
            Přesnou cenu určíme vždy až osobně na místě.
          </p>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mt-2">
            Pokud jste s přibližnou cenou spokojeni vyplňte prosím všechna pole a klikněte 
            na objednat. Ozvěme se Vám nejpozději do 24 hodin a domluvíme podrobnosti.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type and Area */}
            <div className="glass-panel">
              <h3 className="section-title">
                <span className="icon">🏠</span>
                Typ plochy *
              </h3>
              <div className="radio-group mb-6">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="selectedWork"
                    value="Půdorys"
                    checked={formData.selectedWork === 'Půdorys'}
                    onChange={(e) => handleInputChange('selectedWork', e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span className="icon">📐</span>
                  Plocha podlahy
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="selectedWork"
                    value="Stěna"
                    checked={formData.selectedWork === 'Stěna'}
                    onChange={(e) => handleInputChange('selectedWork', e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span className="icon">🧱</span>
                  Plocha stěny
                </label>
              </div>

              <div className="prominent-input-section">
                <label className="prominent-input-label">
                  <span className="icon">📏</span>
                  Celková plocha (m²) - bílá barva *
                </label>
                <input
                  type="number"
                  className="prominent-input"
                  value={formData.totalArea}
                  onChange={(e) => handleInputChange('totalArea', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="mt-6">
                <h3 className="section-title">
                  <span className="icon">🔧</span>
                  Typ opravy *
                </h3>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="repairType"
                      value="Malé"
                      checked={formData.repairType === 'Malé'}
                      onChange={(e) => handleInputChange('repairType', e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    <span className="icon">🔨</span>
                    Malé
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="repairType"
                      value="Střední"
                      checked={formData.repairType === 'Střední'}
                      onChange={(e) => handleInputChange('repairType', e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    <span className="icon">🛠️</span>
                    Střední
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="repairType"
                      value="Velké"
                      checked={formData.repairType === 'Velké'}
                      onChange={(e) => handleInputChange('repairType', e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    <span className="icon">⚒️</span>
                    Velké
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="repairType"
                      value="Žádné"
                      checked={formData.repairType === 'Žádné'}
                      onChange={(e) => handleInputChange('repairType', e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    <span className="icon">✨</span>
                    Žádné
                  </label>
                </div>
              </div>
            </div>

            {/* Materials and Services */}
            <div className="glass-panel">
              <h3 className="section-title">
                <span className="icon">🎨</span>
                Materiál a služby *
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="input-label mb-3 block">
                    <span className="icon">🪣</span>
                    Barva zajistit malíř? *
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="material"
                        value="Ano"
                        checked={formData.material === 'Ano'}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">✅</span>
                      Ano
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="material"
                        value="Ne"
                        checked={formData.material === 'Ne'}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">❌</span>
                      Ne
                    </label>
                  </div>
                </div>

                <div>
                  <label className="input-label mb-3 block">
                    <span className="icon">📦</span>
                    Posunutí a zakrytí nábytku? *
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="furnitureMoving"
                        value="Ano"
                        checked={formData.furnitureMoving === 'Ano'}
                        onChange={(e) => handleInputChange('furnitureMoving', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">✅</span>
                      Ano
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="furnitureMoving"
                        value="Ne"
                        checked={formData.furnitureMoving === 'Ne'}
                        onChange={(e) => handleInputChange('furnitureMoving', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">❌</span>
                      Ne
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-6">
                <div>
                  <label className="input-label mb-3 block">
                    <span className="icon">🏠</span>
                    Prázdný (nezařizený) prostor? *
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="emptySpace"
                        value="Ano"
                        checked={formData.emptySpace === 'Ano'}
                        onChange={(e) => handleInputChange('emptySpace', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">✅</span>
                      Ano
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="emptySpace"
                        value="Ne"
                        checked={formData.emptySpace === 'Ne'}
                        onChange={(e) => handleInputChange('emptySpace', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">❌</span>
                      Ne
                    </label>
                  </div>
                </div>

                <div>
                  <label className="input-label mb-3 block">
                    <span className="icon">🪟</span>
                    Koberce na podlaze *
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="carpets"
                        value="Ano"
                        checked={formData.carpets === 'Ano'}
                        onChange={(e) => handleInputChange('carpets', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">✅</span>
                      Ano
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="carpets"
                        value="Ne"
                        checked={formData.carpets === 'Ne'}
                        onChange={(e) => handleInputChange('carpets', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">❌</span>
                      Ne
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="glass-panel">
              <h3 className="section-title">
                <span className="icon">📋</span>
                Dodatečné informace
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="input-label">
                    <span className="icon">🚪</span>
                    Počet místností *
                  </label>
                  <input
                    type="number"
                    className="glass-input"
                    value={formData.rooms}
                    onChange={(e) => handleInputChange('rooms', e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">
                    <span className="icon">📐</span>
                    Výška stropu (cm) *
                  </label>
                  <input
                    type="number"
                    className="glass-input"
                    value={formData.ceilingHeight}
                    onChange={(e) => handleInputChange('ceilingHeight', e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="input-label mb-3 block">
                  <span className="icon">🏢</span>
                  Typ prostoru *
                </label>
                <div className="radio-group grid grid-cols-2 gap-2">
                  {[
                    { value: 'Pokoj', icon: '🛏️' },
                    { value: 'Byt', icon: '🏠' },
                    { value: 'Dům', icon: '🏡' },
                    { value: 'Společné prostory (chodby, schodiště atd)', icon: '🚶' },
                    { value: 'Kancelář, ordinace atd', icon: '💼' },
                    { value: 'Pension/hotel', icon: '🏨' },
                    { value: 'Komerční prostory (obchody, kavárna, restaurace atd)', icon: '🏪' }
                  ].map((type) => (
                    <label key={type.value} className="radio-option">
                      <input
                        type="radio"
                        name="spaceType"
                        value={type.value}
                        checked={formData.spaceType === type.value}
                        onChange={(e) => handleInputChange('spaceType', e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span className="icon">{type.icon}</span>
                      {type.value}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="input-label">
                  <span className="icon">📅</span>
                  Preferované datum *
                </label>
                <input
                  type="date"
                  className="glass-input"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">
                  <span className="icon">💬</span>
                  Doplňující informace *
                </label>
                <textarea
                  className="glass-input min-h-[100px] resize-none"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column - Price Display and Contact */}
          <div className="lg:col-span-1">
            <div className="glass-panel sticky top-4">
              <div className="text-center">
                <div className="price-display">
                  {totalPrice.toLocaleString('cs-CZ')} Kč
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isOrderEnabled}
                  className={`order-button w-full mb-6 ${isOrderEnabled ? 'order-button-active' : 'order-button-disabled'}`}
                >
                  {isSubmitting ? 'Moment...' : submitMessage === 'Poptávka odeslána!' ? 'Děkujeme' : 'OBJEDNAT'}
                </button>

                {/* Contact Information */}
                <div className="space-y-4 text-left">
                  <h3 className="section-title text-center">
                    <span className="icon">📞</span>
                    Kontaktní údaje
                  </h3>
                  
                  <div>
                    <label className="input-label">
                      <span className="icon">👤</span>
                      Vaše jméno *
                    </label>
                    <input
                      type="text"
                      className="glass-input"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">
                      <span className="icon">📍</span>
                      Adresa výmalby *
                    </label>
                    <input
                      type="text"
                      className="glass-input"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">
                      <span className="icon">📞</span>
                      Telefonní číslo
                    </label>
                    <div className="required-text-below">(nutné vyplnit)</div>
                    <input
                      type="tel"
                      className="glass-input"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+420"
                    />
                  </div>

                  <div>
                    <label className="input-label">
                      <span className="icon">📧</span>
                      E-mail
                    </label>
                    <div className="required-text-below">(nutné vyplnit)</div>
                    <input
                      type="email"
                      className="glass-input"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="@"
                    />
                  </div>
                </div>

                {submitMessage && (
                  <p className={`mt-4 text-sm ${submitMessage.includes('Chyba') ? 'text-red-600' : 'text-green-600'}`}>
                    {submitMessage}
                  </p>
                )}
              </div>

              <div className="mt-8 text-xs text-gray-600 space-y-2">
                <p>• K celkové ceně je už v online kalkulaci automaticky připočtena cena za úklid.</p>
                <p>• Podkladová penetrace není součástí kalkulace a bude započtena jen o případě.</p>
                <p>• Cena může dále výjimečně kolísat u cenách nemovitostí plus. Všechny ostatní služby nezapoctené
                dispěnují snosd budou též během a klientem započteny navíc dle dohody s klientem navíc na místě.</p>
                <p>• Uvedená kalkulačka je především informační.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;