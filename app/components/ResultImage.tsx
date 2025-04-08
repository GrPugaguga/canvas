import React, { useState, useRef, useEffect } from 'react';
import './ResultImage.css';
import html2canvas from 'html2canvas';

export interface MessageStyle {
  color: string;
  fontSize: number;
  fontFamily: string;
  x: number;
  y: number;
}

export interface Message {
  id: string;
  text: string;
  style: MessageStyle;
}

export interface DrawingLine {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export enum DrawingTool {
  Pen = 'pen'
}

export interface ResultImageProps {
  backgroundImage: string;
  giftImage: string;
  decorationImage?: string;
  showDecoration?: boolean;
  messages?: Message[];
  drawingLines?: DrawingLine[];
  drawColor?: string;
  drawWidth?: number;
  drawingTool?: DrawingTool;
  onAddMessage?: (message: Message) => void;
  onUpdateMessage?: (message: Message) => void;
  onDeleteMessage?: (id: string) => void;
  onUpdateDrawingLines?: (lines: DrawingLine[]) => void;
  onChangeMessageColor?: (id: string, color: string) => void;
  onChangeMessageSize?: (id: string, size: number) => void;
  onUndoDrawing?: () => void;
}

export const ResultImage: React.FC<ResultImageProps> = ({
  backgroundImage,
  giftImage,
  decorationImage,
  showDecoration = false,
  messages = [],
  drawingLines = [],
  drawColor = '#ff0000',
  drawWidth = 3,
  drawingTool = DrawingTool.Pen,
  onAddMessage,
  onUpdateMessage,
  onDeleteMessage,
  onUpdateDrawingLines,
  onChangeMessageColor,
  onChangeMessageSize,
  onUndoDrawing
}) => {
  const [currentMessages, setCurrentMessages] = useState<Message[]>(messages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState<string | null>(null);
  const [currentLines, setCurrentLines] = useState<DrawingLine[]>(drawingLines);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRefsMap = useRef<{[id: string]: HTMLDivElement | null}>({});
  
  // Функция для сохранения ссылок на текстовые элементы
  const setTextRef = (el: HTMLDivElement | null, id: string) => {
    textRefsMap.current[id] = el;
  };
  
  // Эффект для обновления сообщений
  useEffect(() => {
    setCurrentMessages(messages);
  }, [messages]);
  
  // Эффект для обновления линий
  useEffect(() => {
    setCurrentLines(drawingLines);
  }, [drawingLines]);
  
  // Эффект для настройки канваса
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = imageWrapperRef.current;
    if (!container) return;
    
    // Установка размеров канваса
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Отрисовка существующих линий
    drawExistingLines();
  }, []);
  
  // Отрисовка существующих линий
  const drawExistingLines = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Очищаем канвас полностью перед каждой отрисовкой
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем все линии
    [...currentLines, currentLine].filter(Boolean).forEach(line => {
      if (!line || line.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);
      
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  };
  
  // Эффект для отрисовки линий при их изменении
  useEffect(() => {
    drawExistingLines();
  }, [currentLines, currentLine]);
  
  // Обработчик клика на канвас для снятия выделения с сообщений
  const handleCanvasClick = () => {
    setSelectedMessageId(null);
  };
  
  // Отмена последнего рисования
  const handleUndoDrawing = () => {
    if (currentLines.length > 0) {
      const newLines = [...currentLines];
      newLines.pop(); // Удаляем последнюю линию
      setCurrentLines(newLines);
      
      if (onUpdateDrawingLines) {
        onUpdateDrawingLines(newLines);
      }
      
      if (onUndoDrawing) {
        onUndoDrawing();
      }
    }
  };
  
  // Обработчики для рисования
  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    setSelectedMessageId(null);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    setCurrentLine({
      points: [{ x, y }],
      color: drawColor,
      width: drawWidth
    });
    
    setIsDrawing(true);
  };
  
  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentLine || !canvasRef.current) return;
    
    e.preventDefault(); // Предотвращаем скроллинг при рисовании на мобильных устройствах
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    setCurrentLine({
      ...currentLine,
      points: [...currentLine.points, { x, y }]
    });
  };
  
  const handleEndDrawing = () => {
    if (isDrawing && currentLine) {
      const newLines = [...currentLines, currentLine];
      setCurrentLines(newLines);
      setCurrentLine(null);
      setIsDrawing(false);
      
      if (onUpdateDrawingLines) {
        onUpdateDrawingLines(newLines);
      }
    }
  };
  
  // Изменение цвета выбранного сообщения
  const handleChangeMessageColor = (color: string) => {
    if (!selectedMessageId) return;
    
    const updatedMessages = currentMessages.map(msg => {
      if (msg.id === selectedMessageId) {
        const updatedMsg = {
          ...msg,
          style: {
            ...msg.style,
            color
          }
        };
        
        if (onUpdateMessage) {
          onUpdateMessage(updatedMsg);
        }
        
        if (onChangeMessageColor) {
          onChangeMessageColor(selectedMessageId, color);
        }
        
        return updatedMsg;
      }
      return msg;
    });
    
    setCurrentMessages(updatedMessages);
  };
  
  // Изменение размера выбранного сообщения
  const handleChangeMessageSize = (size: number) => {
    if (!selectedMessageId) return;
    
    const updatedMessages = currentMessages.map(msg => {
      if (msg.id === selectedMessageId) {
        const updatedMsg = {
          ...msg,
          style: {
            ...msg.style,
            fontSize: size
          }
        };
        
        if (onUpdateMessage) {
          onUpdateMessage(updatedMsg);
        }
        
        if (onChangeMessageSize) {
          onChangeMessageSize(selectedMessageId, size);
        }
        
        return updatedMsg;
      }
      return msg;
    });
    
    setCurrentMessages(updatedMessages);
  };
  
  // Обработчики для перетаскивания текста
  const handleMessageClick = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    setSelectedMessageId(id);
  };
  
  const handleStartDragText = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    setIsDraggingText(id);
    setSelectedMessageId(id);
    e.stopPropagation();
  };
  
  const handleDragText = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (isDraggingText !== id || !imageWrapperRef.current) return;
    
    const rect = imageWrapperRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const updatedMessages = currentMessages.map(msg => {
      if (msg.id === id) {
        const updatedMsg = {
          ...msg,
          style: {
            ...msg.style,
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y))
          }
        };
        
        if (onUpdateMessage) {
          onUpdateMessage(updatedMsg);
        }
        
        return updatedMsg;
      }
      return msg;
    });
    
    setCurrentMessages(updatedMessages);
  };
  
  const handleEndDragText = () => {
    setIsDraggingText(null);
  };
  
  const handleDeleteMessage = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (onDeleteMessage) {
      onDeleteMessage(id);
    } else {
      const filteredMessages = currentMessages.filter(msg => msg.id !== id);
      setCurrentMessages(filteredMessages);
    }
    setSelectedMessageId(null);
  };
  
  // Обработчик для глобального клика для снятия выделения с сообщений
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (selectedMessageId && imageWrapperRef.current) {
        const target = e.target as Node;
        if (!imageWrapperRef.current.contains(target)) {
          setSelectedMessageId(null);
        }
      }
    };
    
    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [selectedMessageId]);
  
  // Обработчик для глобального mousemove и mouseup, чтобы можно было рисовать даже если курсор вышел за границы канваса
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawing && currentLine && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Проверка, находится ли курсор в пределах канваса
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          setCurrentLine({
            ...currentLine,
            points: [...currentLine.points, { x, y }]
          });
        }
      }
      
      if (isDraggingText && imageWrapperRef.current) {
        const rect = imageWrapperRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          const updatedMessages = currentMessages.map(msg => {
            if (msg.id === isDraggingText) {
              const updatedMsg = {
                ...msg,
                style: {
                  ...msg.style,
                  x: Math.max(0, Math.min(100, x)),
                  y: Math.max(0, Math.min(100, y))
                }
              };
              
              if (onUpdateMessage) {
                onUpdateMessage(updatedMsg);
              }
              
              return updatedMsg;
            }
            return msg;
          });
          
          setCurrentMessages(updatedMessages);
        }
      }
    };
    
    const handleMouseUp = () => {
      if (isDrawing) {
        handleEndDrawing();
      }
      
      if (isDraggingText) {
        handleEndDragText();
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawing, currentLine, isDraggingText, currentMessages]);
  
  const saveImage = () => {
    if (imageWrapperRef.current) {
      const buttonsToHide = document.querySelectorAll('.deleteMessageBtn, .messageControls');
      buttonsToHide.forEach(btn => {
        (btn as HTMLElement).style.display = 'none';
      });
      
      // Временно скрываем выделение
      setSelectedMessageId(null);
      
      html2canvas(imageWrapperRef.current).then((canvas: HTMLCanvasElement) => {
        // Возвращаем кнопки удаления
        buttonsToHide.forEach(btn => {
          (btn as HTMLElement).style.display = 'block';
        });
        
        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        link.download = 'gift-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  // Получаем выбранное сообщение
  const selectedMessage = selectedMessageId 
    ? currentMessages.find(msg => msg.id === selectedMessageId) 
    : null;

  return (
    <div className="resultContainer">
      <div 
        className="imageWrapper" 
        ref={imageWrapperRef}
        onClick={handleCanvasClick}
      >
        <img 
          src={backgroundImage} 
          alt="Фон" 
          className="backgroundImage" 
        />
        <img 
          src={giftImage} 
          alt="Подарок" 
          className="giftImage" 
        />
        {showDecoration && decorationImage && (
          <img 
            src={decorationImage} 
            alt="Украшение" 
            className="decorImage" 
          />
        )}
        
        <canvas 
          ref={canvasRef}
          className="drawingCanvas"
          onMouseDown={handleStartDrawing}
          onMouseMove={handleDraw}
          onMouseUp={handleEndDrawing}
          onTouchStart={handleStartDrawing}
          onTouchMove={handleDraw}
          onTouchEnd={handleEndDrawing}
        />
        
        {currentMessages.map(message => (
          <div 
            key={message.id}
            className={`movableMessageText ${selectedMessageId === message.id ? 'selected' : ''}`}
            ref={(el) => setTextRef(el, message.id)}
            style={{
              color: message.style.color,
              fontSize: `${message.style.fontSize}px`,
              fontFamily: message.style.fontFamily,
              left: `${message.style.x}%`,
              top: `${message.style.y}%`
            }}
            onClick={(e) => handleMessageClick(e, message.id)}
            onMouseDown={(e) => handleStartDragText(e, message.id)}
            onMouseMove={(e) => handleDragText(e, message.id)}
            onMouseUp={handleEndDragText}
          >
            {message.text}
            {selectedMessageId === message.id && (
              <>
                <button 
                  className="deleteMessageBtn" 
                  onClick={(e) => handleDeleteMessage(e, message.id)}
                  title="Удалить"
                >
                  &times;
                </button>
                <div className="messageControls">
                  <input 
                    type="color" 
                    value={message.style.color}
                    onChange={(e) => handleChangeMessageColor(e.target.value)}
                    className="messageColorPicker"
                    title="Изменить цвет"
                  />
                  <div className="messageSizeControls">
                    <button 
                      onClick={() => handleChangeMessageSize(Math.max(12, message.style.fontSize - 6))}
                      className="messageSizeBtn decreaseBtn"
                      title="Уменьшить размер"
                    >
                      -
                    </button>
                    <span className="messageSizeValue">{message.style.fontSize}px</span>
                    <button 
                      onClick={() => handleChangeMessageSize(Math.min(94, message.style.fontSize + 6))}
                      className="messageSizeBtn increaseBtn"
                      title="Увеличить размер"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="controlsContainer">
        <button className="saveButton" onClick={saveImage}>
          Сохранить изображение
        </button>
        <button className="undoButton" onClick={handleUndoDrawing} title="Отменить последнее рисование">
          Отменить рисование
        </button>
      </div>
    </div>
  );
};

export default ResultImage; 