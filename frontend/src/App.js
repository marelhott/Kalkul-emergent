import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './App.css';

function App() {
  // EmailJS configuration
  const EMAILJS_CONFIG = {
    serviceID: 'service_nis6m4f',
    businessTemplateID: 'template_cgsqabs', // Pro firmu
    customerTemplateID: 'template_65qsr9b', // Pro zákazníka
    publicKey: 'tlLoPqBmzHfTBB5Hx'
  };
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

  // Check if order button should be enabled
  const isOrderEnabled = formData.email.trim() !== '' && formData.phone.trim() !== '';

  // Get button class and text based on state
  const getButtonClass = () => {
    if (isSubmitted) return 'order-button order-button-success w-full mb-6';
    if (isSubmitting) return 'order-button order-button-submitting w-full mb-6';
    if (isOrderEnabled) return 'order-button order-button-active w-full mb-6';
    return 'order-button order-button-disabled w-full mb-6';
  };

  const getButtonText = () => {
    if (isSubmitted) return '👍 ODESLÁNO';
    if (isSubmitting) return 'ODESÍLÁM';
    return 'ODESLAT';
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
      // Příprava dat pro email
      const emailData = {
        // Základní informace
        customer_name: formData.name || 'Neuvedeno',
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address || 'Neuvedeno',
        
        // Typ práce a plocha
        work_type: formData.selectedWork === 'Půdorys' ? 'Plocha podlahy' : 'Plocha stěny',
        total_area: formData.totalArea || '0',
        
        // Typ opravy
        repair_type: formData.repairType || 'Neuvedeno',
        
        // Služby
        material_provided: formData.material === 'Ano' ? 'Ano' : 'Ne',
        furniture_moving: formData.furnitureMoving === 'Ano' ? 'Ano' : 'Ne',
        empty_space: formData.emptySpace === 'Ano' ? 'Ano' : 'Ne',
        carpets: formData.carpets === 'Ano' ? 'Ano' : 'Ne',
        
        // Dodatečné informace
        rooms_count: formData.rooms || 'Neuvedeno',
        ceiling_height: formData.ceilingHeight || 'Neuvedeno',
        space_type: formData.spaceType || 'Neuvedeno',
        preferred_date: formData.date || 'Neuvedeno',
        additional_info: formData.additionalInfo || 'Žádné dodatečné informace',
        
        // Kalkulace
        calculated_price: totalPrice.toLocaleString('cs-CZ'),
        
        // Metadata
        timestamp: new Date().toLocaleString('cs-CZ'),
        to_email: 'info@malirivcernem.cz'
      };

      console.log('🔄 Začínám odesílání emailů...');

      // Email 1: Pro firmu (info@malirivcernem.cz)
      console.log('📧 Odesílám email pro firmu...');
      const businessEmailResponse = await emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.businessTemplateID,
        emailData,
        EMAILJS_CONFIG.publicKey
      );

      console.log('✅ Email pro firmu úspěšně odeslán!', businessEmailResponse);

      // Email 2: Pro zákazníka - příprava dat
      const customerEmailData = {
        ...emailData,
        to_email: formData.email // Změníme recipient na zákazníka
      };

      console.log('📧 Odesílám email pro zákazníka na:', formData.email);
      const customerEmailResponse = await emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.customerTemplateID,
        customerEmailData,
        EMAILJS_CONFIG.publicKey
      );

      console.log('✅ Email pro zákazníka úspěšně odeslán!', customerEmailResponse);
      
      // Úspěch - nastavíme stavy
      setIsSubmitted(true);
      setSubmitMessage('Oba emaily úspěšně odeslány!');
      
    } catch (error) {
      console.error('❌ Chyba při odesílání emailu:', error);
      setIsSubmitted(false);
      setSubmitMessage('Chyba při odesílání. Zkuste to znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="mx-auto" style={{maxWidth: '1000px'}}>
        {/* Header */}
        <div className="glass-panel text-center py-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-700 mb-2" style={{fontFamily: 'Touche Medium, sans-serif', letterSpacing: '0.05em'}}>
            Cena a termín
          </h1>
          <div class="w-16 h-1 bg-gradient-to-r from-orange-400 to-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto" style={{fontFamily: 'Touche, sans-serif'}}>
            Spočítejte si sami cenu a určete termín startu realizace zakázky. Ceny jsou přibližné. Přesnou cenu upřesníme vždy až osobně na místě.
          </p>
          <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto mt-2" style={{fontFamily: 'Touche, sans-serif'}}>
            Pokud jste s přibližnou cenou spokojeni vyplňte prosím všechna pole a klikněte na odeslat. Ozveme se Vám nejpozději do 24 hodin a domluvíme podrobnosti.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type and Area */}
            <div className="glass-panel">
              <h3 className="section-title" style={{fontFamily: 'Touche Medium, sans-serif'}}>
                <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
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
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="12" y1="3" x2="12" y2="21"/>
                  </svg>
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
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M3 9h18"/>
                  </svg>
                  Plocha stěny
                </label>
              </div>

              <div className="prominent-input-section">
                <label className="prominent-input-label">
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
                    <polyline points="7.5,19.79 7.5,14.6 3,12"/>
                    <polyline points="21,12 16.5,14.6 16.5,19.79"/>
                  </svg>
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
                <h3 className="section-title" style={{fontFamily: 'Touche Medium, sans-serif'}}>
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                    <path d="M13 12h3"/>
                    <path d="M8 12H5"/>
                  </svg>
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
                    <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6"/>
                      <path d="M1 12h6m6 0h6"/>
                    </svg>
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
                    <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="6"/>
                      <path d="M12 2v4m0 8v4"/>
                      <path d="M2 12h4m8 0h4"/>
                    </svg>
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
                    <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 2v20"/>
                      <path d="M2 12h20"/>
                    </svg>
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
                    <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9 9l6 6"/>
                      <path d="M15 9l-6 6"/>
                    </svg>
                    Žádné
                  </label>
                </div>
              </div>
            </div>

            {/* Materials and Services */}
            <div className="glass-panel">
              <h3 className="section-title" style={{fontFamily: 'Touche Medium, sans-serif'}}>
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

            {/* Preferované datum - samostatná sekce */}
            <div className="glass-panel">
              <h3 className="section-title" style={{fontFamily: 'Touche Medium, sans-serif'}}>
                <span className="icon">📅</span>
                Preferované datum *
              </h3>
              <input
                type="date"
                className="glass-input"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>

            {/* Additional Details */}
            <div className="glass-panel">
              <h3 className="section-title" style={{fontFamily: 'Touche Medium, sans-serif'}}>
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
                  className={getButtonClass()}
                >
                  {getButtonText()}
                </button>

                {/* Contact Information */}
                <div className="space-y-4 text-left">
                  <h3 className="section-title text-center" style={{fontFamily: 'Touche Medium, sans-serif', fontSize: '18px'}}>
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

              <div className="mt-8 text-xs text-slate-600 space-y-3 leading-relaxed">
                <p>• K celkové ceně je už v online kalkulaci automaticky připočtena cena za úklid.</p>
                
                <p>• Podkladová penetrace není součástí kalkulace a bude zaceněna jen v případě, že bude potřeba (zjistíme až na místě)</p>
                
                <p>• V ceně každé zakázky při potvrzením nákupu barvy je v ceně primalex plus, všechny ostatní barvy jako například tónované, plně omyvatelné, disperzní apod budou dle dohody s klientem zaceněny navíc dle domluvy na místě.</p>
                
                <p>• Tónované barvy a jejich výmalba je součastí kalkulace až na místě s klientem</p>
                
                <p>• Doprava po Praze je v ceně, bližší až vzdálenější okolí Prahy bude zpoplatněno dle vzdálenosti a dle dohody.</p>
                
                <p>• Speciální opravy a úpravy jako je strhávání tapet, odstraňování skvrn, celopošný štuk, stěrkování apod jsou řešeny a naceňovány navíc až na místě.</p>
                
                <p>• <strong>Žádné opravy</strong> - jedná se o žádné, nebo minimální opravy jako vyspravení pár dírek po obrazech.</p>
                
                <p>• <strong>Malé opravy:</strong> jedná se o vyplnění malých otvorů a opravu drobných trhlin, obitých rohů, menší tmelení.</p>
                
                <p>• <strong>Střední opravy:</strong> jedná se o lokální škrábání menších ploch, rozsáhlejší trhliny, vyspravení omítek, vyrovnání i oprava poškozených štuků.</p>
                
                <p>• <strong>Velké opravy:</strong> jedná se o rozsáhlejší škrábání (v případě celoplošného škrábání je potřeba dodatečných prací, doceněno na místě malířem) a jakékoli rozsáhlejší opravy na větších plochách, které však nezahrnují stěrkování.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;