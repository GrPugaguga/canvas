'use client';
import { useState, useEffect } from 'react';
import './page.css';
import { ResultImage, MessageStyle, DrawingLine, Message, DrawingTool } from './components/ResultImage';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  // Состояния для выбранных изображений
  const [selectedBackground, setSelectedBackground] = useState<number>(0);
  const [selectedGift, setSelectedGift] = useState<number>(0);
  const [selectedDecor, setSelectedDecor] = useState<number>(0);
  const [showDecoration, setShowDecoration] = useState<boolean>(true);
  
  // Состояние для текущего сообщения (ввод)
  const [currentMessageText, setCurrentMessageText] = useState<string>('');
  
  // Состояния для сообщений
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  // Общие настройки цвета для текста и рисования
  const [mainColor, setMainColor] = useState<string>('#e91e63');
  
  // Состояния для стиля текста
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  
  // Состояния для рисования
  const [drawWidth, setDrawWidth] = useState<number>(3);
  const [drawingLines, setDrawingLines] = useState<DrawingLine[]>([]);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>(DrawingTool.Pen);

  // Количество доступных изображений каждого типа
  const numBackgrounds = 4;
  const numGifts = 4;
  const numDecors = 5;

  // Пути к изображениям
  const backgroundImage = `GIFT_IMAGES/BACKGROUND/${selectedBackground}.jpeg`;
  const giftImage = `GIFT_IMAGES/GIFT/${selectedGift}.png`;
  const decorationImage = selectedDecor !== null && selectedDecor > 0 
    ? `GIFT_IMAGES/DECORATION/${selectedDecor}.png` 
    : null;

  const handleMessageTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessageText(e.target.value);
  };
  
  const handleMainColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainColor(e.target.value);
  };
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(e.target.value));
  };
  
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFontFamily(e.target.value);
  };
  
  const handleDrawWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDrawWidth(Number(e.target.value));
  };
  
  const toggleDrawingTool = () => {
    // Больше не переключаем между Pen и Eraser, так как Eraser удален
    // Здесь можно добавить другую логику, если нужно
    // Пока просто держим Pen
    setDrawingTool(DrawingTool.Pen);
  };
  
  const generateMessageId = () => {
    return `message-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };
  
  const addMessage = () => {
    if (!currentMessageText.trim()) return;
    
    const newMessage: Message = {
      id: uuidv4(),
      text: currentMessageText,
      style: {
        color: mainColor,
        fontSize: fontSize,
        fontFamily: fontFamily,
        x: 50, // Начальная позиция в процентах
        y: 50  // Начальная позиция в процентах
      }
    };
    
    setMessages([...messages, newMessage]);
    setCurrentMessageText('');
  };
  
  const updateMessage = (updatedMessage: Message) => {
    setMessages(messages.map(msg => 
      msg.id === updatedMessage.id ? updatedMessage : msg
    ));
  };
  
  const changeMessageColor = (id: string, color: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, style: { ...msg.style, color } } : msg
    ));
  };
  
  const changeMessageSize = (id: string, size: number) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, style: { ...msg.style, fontSize: size } } : msg
    ));
  };
  
  const deleteMessage = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id));
    if (selectedMessageId === id) {
      setSelectedMessageId(null);
    }
  };
  
  const updateDrawingLines = (lines: DrawingLine[]) => {
    setDrawingLines(lines);
  };
  
  const clearDrawings = () => {
    setDrawingLines([]);
  };

  // Функция для обработки отмены последнего рисования
  const handleUndoDrawing = () => {
    // Если есть линии рисования
    if (drawingLines.length > 0) {
      // Создаем копию массива без последней линии
      const newLines = [...drawingLines];
      newLines.pop();
      setDrawingLines(newLines);
    }
  };

  return (
    <main className="mainContainer">
      <h1 className="title">Конструктор Изображений</h1>
      
      <div className="content">
        <div className="constructor">
          <div className="sectionControl">
            <h2>Выберите фон</h2>
            <div className="imageOptions">
              {Array.from({ length: numBackgrounds }).map((_, index) => (
                <div 
                  key={`background-${index}`}
                  className={`imageOption ${selectedBackground === index ? 'selected' : ''}`}
                  onClick={() => setSelectedBackground(index)}
                >
                  <img 
                    src={`GIFT_IMAGES/BACKGROUND/${index}.jpeg`} 
                    alt={`Фон ${index + 1}`} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="sectionControl">
            <h2>Выберите подарок</h2>
            <div className="imageOptions">
              {Array.from({ length: numGifts }).map((_, index) => (
                <div 
                  key={`gift-${index}`}
                  className={`imageOption ${selectedGift === index ? 'selected' : ''}`}
                  onClick={() => setSelectedGift(index)}
                >
                  <img 
                    src={`GIFT_IMAGES/GIFT/${index}.png`} 
                    alt={`Подарок ${index + 1}`} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="sectionControl">
            <div className="decorHeader">
              <h2>Выберите декорацию</h2>
            </div>
              <div className="imageOptions">
                {Array.from({ length: numDecors }).map((_, index) => (
                  <div 
                    key={`decor-${index}`}
                    className={`imageOption ${selectedDecor === index ? 'selected' : ''}`}
                    onClick={() => setSelectedDecor(index)}
                  >
                   {index !== 0 ? <img 
                      src={`GIFT_IMAGES/DECORATION/${index}.png`} 
                      alt={`Декорация ${index + 1}`} 
                    /> : null}
                  </div>
                ))}
              </div>
          </div>
          <div className="sectionControl">
            <div className="decorHeader">
              <h2>Customize</h2>
            </div>
            <div className="customizeOptions">
              <div className="customizeGroup">
                <div className="colorSettingsHeader">
                  <h3>Общие настройки</h3>
                  <div className="colorPickerContainer">
                    <input 
                      type="color" 
                      value={mainColor} 
                      onChange={handleMainColorChange}
                      className="mainColorPicker"
                    />
                    <span className="colorLabel">Основной цвет</span>
                  </div>
                </div>
              </div>
              
              <div className="customizeGroup">
                <h3>Добавить текст</h3>
                <div className="messageInput">
                  <textarea 
                    id="messageText" 
                    value={currentMessageText} 
                    onChange={handleMessageTextChange}
                    placeholder="Введите ваше сообщение здесь..."
                    maxLength={100}
                  />
                </div>
                <div className="controlsRow">
                  <div className="controlItem">
                    <label>Размер:</label>
                    <input 
                      type="range" 
                      min="12" 
                      max="48" 
                      value={fontSize} 
                      onChange={handleFontSizeChange}
                    />
                    <span>{fontSize}px</span>
                  </div>
                </div>
                <div className="controlItem">
                  <label>Шрифт:</label>
                  <select value={fontFamily} onChange={handleFontFamilyChange} className="fontSelect">
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>
                <button className="addButton" onClick={addMessage}>
                  Добавить сообщение
                </button>
              </div>
              
              <div className="customizeGroup">
                <h3>Рисование</h3>
                <div className="controlsRow">
                  <div className="controlItem">
                    <label>Толщина:</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={drawWidth} 
                      onChange={handleDrawWidthChange}
                    />
                    <span>{drawWidth}px</span>
                  </div>
                </div>
                <div className="drawingTools">
                  <div className="toolButtons">
                    <button 
                      className={`drawingToolBtn ${drawingTool === DrawingTool.Pen ? 'active' : ''}`}
                      onClick={() => setDrawingTool(DrawingTool.Pen)}
                      title="Карандаш"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="actionButtons">
                    <button className="undoButton" onClick={handleUndoDrawing} title="Отменить последнее рисование">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 14 4 9l5-5"/>
                        <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H10"/>
                      </svg>
                    </button>
                    <button className="clearButton" onClick={clearDrawings} title="Очистить все рисунки">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="preview">
          <h2>Предпросмотр</h2>
          <div className="previewContainer">
            <ResultImage 
              backgroundImage={backgroundImage}
              giftImage={giftImage}
              decorationImage={decorationImage || undefined}
              showDecoration={!!decorationImage}
              messages={messages}
              drawingLines={drawingLines}
              drawColor={mainColor}
              drawWidth={drawWidth}
              drawingTool={drawingTool}
              onUpdateMessage={updateMessage}
              onDeleteMessage={deleteMessage}
              onUpdateDrawingLines={updateDrawingLines}
              onChangeMessageColor={changeMessageColor}
              onChangeMessageSize={changeMessageSize}
              onUndoDrawing={handleUndoDrawing}
            />
          </div>
        </div>
        </div>
      </main>
  );
} 