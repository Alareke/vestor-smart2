/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI, Type } from '@google/genai';
import { UploadCloud, Wand2, Loader2, Code, SlidersHorizontal, Palette, Save, Download, Trash2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SketchControl = ({ control, onUpdate, iframeRef }) => {
    const [value, setValue] = useState(control.defaultValue);

    const handleChange = (newValue) => {
        setValue(newValue);
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_PARAMS',
                payload: { [control.name]: newValue },
            }, '*');
        }
    };

    useEffect(() => {
        setValue(control.defaultValue);
    }, [control.defaultValue]);

    if (control.type === 'slider') {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                    <label className="text-white font-medium">{control.label}</label>
                    <span className="text-[#8A93A2] font-mono bg-[#12161D] px-1.5 py-0.5 rounded">{Number(value).toFixed(2)}</span>
                </div>
                <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={value}
                    onChange={(e) => handleChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#12161D] rounded-lg appearance-none cursor-pointer accent-[#3E8BF3]"
                />
            </div>
        );
    }

    if (control.type === 'color') {
        return (
            <div className="flex items-center justify-between">
                <label className="text-white font-medium text-xs">{control.label}</label>
                <div className="relative w-8 h-6 rounded border border-[#2A3040] overflow-hidden">
                    <div className="w-full h-full" style={{ backgroundColor: value }} />
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
        );
    }

    if (control.type === 'boolean') {
        return (
            <div className="flex items-center justify-between">
                <label className="text-white font-medium text-xs">{control.label}</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={value} onChange={(e) => handleChange(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#12161D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        );
    }

    if (control.type === 'dropdown') {
        return (
            <div className="flex flex-col gap-1">
                <label className="text-white font-medium text-xs">{control.label}</label>
                <select
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full bg-[#12161D] border border-[#2A3040] rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3E8BF3]"
                >
                    {control.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
        );
    }
    
    return null;
};

const ImageSketcher = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imageBase64, setImageBase64] = useState('');
    const [sketchData, setSketchData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('controls');
    const [savedSketches, setSavedSketches] = useState([]);
    const iframeRef = useRef(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('vestor_smart_sketches');
            if (raw && raw !== 'null' && raw !== 'undefined') {
                const storedSketches = JSON.parse(raw);
                setSavedSketches(Array.isArray(storedSketches) ? storedSketches : []);
            } else {
                setSavedSketches([]);
            }
        } catch (e) {
            console.error("Failed to load saved sketches:", e);
            setSavedSketches([]);
        }
    }, []);

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            setImageFile(Object.assign(file, { preview: URL.createObjectURL(file) }));
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageBase64(e.target.result.split(',')[1]);
            };
            reader.readAsDataURL(file);
            setSketchData(null);
            setError('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
        multiple: false,
    });
    
    const generateSketch = async () => {
        if (!imageBase64) return;
        
        setIsLoading(true);
        setError('');
        setSketchData(null);

            You are an expert in creative coding with p5.js. Your task is to transform an image into a highly interactive p5.js sketch.
            1.  Analyze the Image: Analyze the provided image to understand its composition, colors, and dominant shapes.
            2.  Generate p5.js Code: Write a p5.js sketch that creates an abstract, dynamic, and artistic representation of the image. The sketch must be self-contained and run within a standard p5.js setup. Do not use instance mode. The image data will be passed into the sketch via a global variable \`window.injectedImage\`. Your code must load this image in the preload() function like this: \`let img; function preload() { img = loadImage(window.injectedImage); }\`.
            3.  Incorporate Direct Interaction: The sketch MUST be directly interactive. Use p5.js's built-in variables and functions to make the art respond to the user's mouse or keyboard. For example:
                - Have elements follow or react to \`mouseX\` and \`mouseY\`.
                - Change colors, shapes, or behavior when \`mouseIsPressed\` is true.
                - Implement a \`keyPressed()\` function to trigger changes.
            4.  Create Controllable Parameters: The code MUST also be controllable via external UI. Create a global 'params' object with 3-5 variables that users can change to alter the sketch's baseline appearance or behavior (e.g., particle size, speed, complexity).
            5.  Implement Control Listener: The p5.js code MUST include an event listener: \`window.addEventListener('message', (event) => { if (event.data.type === 'UPDATE_PARAMS') { Object.assign(params, event.data.payload); } });\` This will allow the parent window to update the 'params' object.
            6.  Define Controls Schema: You MUST provide a JSON schema describing the controllable parameters you created for the 'params' object.
            7.  Final Output: Respond with a single, raw JSON object, without any markdown formatting. The JSON object must have two keys: "p5js_code" (a string containing the full p5.js code) and "controls_schema" (an array of objects describing the controls).
            
            Controls Schema Format: Each object in "controls_schema" must have "name" (key in 'params'), "label" (user-friendly name), "type" ('slider', 'color', 'boolean', or 'dropdown'), and a "defaultValue".
            - For "slider": include "min", "max", and "step".
            - For "color": the "defaultValue" should be a hex string (e.g., "#ff0000").
            - For "boolean": the "defaultValue" should be true or false.
            - For "dropdown": include an "options" array of strings.
        `;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                p5js_code: { type: Type.STRING },
                controls_schema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            label: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['slider', 'color', 'boolean', 'dropdown'] },
                            min: { type: Type.NUMBER },
                            max: { type: Type.NUMBER },
                            step: { type: Type.NUMBER },
                            defaultValue: { type: Type.ANY },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ['name', 'label', 'type', 'defaultValue'],
                    }
                }
            },
            required: ['p5js_code', 'controls_schema']
        };

        try {
            const response = await ai.models.generateContent({
                contents: {
                    parts: [
                        { inlineData: { mimeType: imageFile.type, data: imageBase64 } }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });

            const text = response.text;
            if (!text || text.trim() === '') {
                throw new Error("AI returned an empty response for sketch generation.");
            }
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error("Failed to parse AI response JSON:", parseError, "Raw text:", text);
                throw new Error("Received malformed data from the AI service. Please try again.");
            }
            setSketchData(data);
        } catch (e) {
            console.error("AI Sketch Generation Error:", e);
            setError(e.message || "Failed to generate sketch. Please try again.");
             if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSketch = () => {
        if (!sketchData || !imageBase64) return;
        if (!name || name.trim() === '') return;

        if (savedSketches.some(s => s.name === name)) {
            alert("A sketch with this name already exists. Please choose a different name.");
            return;
        }

        const newSketch = {
            name: name.trim(),
            sketchData: sketchData,
            imageBase64: imageBase64,
            imageType: imageFile.type,
        };

        const updatedSketches = [...savedSketches, newSketch];
        setSavedSketches(updatedSketches);
        localStorage.setItem('vestor_smart_sketches', JSON.stringify(updatedSketches));
        window.toast?.(`Sketch "${name}" saved!`);
    };

    const handleLoadSketch = (sketchName) => {
        const sketchToLoad = savedSketches.find(s => s.name === sketchName);
        if (sketchToLoad) {
            const { sketchData, imageBase64, imageType } = sketchToLoad;
            
            const dataUrl = `data:${imageType};base64,${imageBase64}`;
            setImageFile({ preview: dataUrl, type: imageType });
            setImageBase64(imageBase64);
            setSketchData(sketchData);
            setError('');
            window.toast?.(`Sketch "${sketchName}" loaded.`);
        }
    };

    const handleDeleteSketch = (sketchName) => {
        if (confirm(`Are you sure you want to delete the sketch "${sketchName}"?`)) {
            const updatedSketches = savedSketches.filter(s => s.name !== sketchName);
            setSavedSketches(updatedSketches);
            localStorage.setItem('vestor_smart_sketches', JSON.stringify(updatedSketches));
            window.toast?.(`Sketch "${sketchName}" deleted.`);
        }
    };


    const sketchHtml = sketchData ? `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>
            <style>body { margin: 0; overflow: hidden; } canvas { display: block; }</style>
        </head>
        <body>
            <script>
                window.injectedImage = "data:${imageFile.type};base64,${imageBase64}";
                ${sketchData.p5js_code}
            </script>
        </body>
        </html>
    ` : '';

    return (
        <div className="h-full flex flex-col md:flex-row text-white bg-[#1E222D]" data-dev-name="ImageSketcher">
            <div className="w-full md:w-64 flex-shrink-0 p-3 border-b md:border-b-0 md:border-r border-[#2A3040] flex flex-col gap-4">
                <div 
                    {...getRootProps()} 
                    className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#383f52] hover:border-blue-500'}`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="mx-auto w-8 h-8 text-[#8A93A2]" />
                    <p className="text-xs mt-2">
                        {isDragActive ? "Drop the image here..." : "Drag & drop an image, or click to select"}
                    </p>
                </div>
                {imageFile && (
                    <div className="space-y-2">
                        <img src={imageFile.preview} alt="Preview" className="rounded-md max-h-32 mx-auto" onLoad={() => { if(imageFile.preview.startsWith('blob:')) URL.revokeObjectURL(imageFile.preview) }} />
                        <div className="flex gap-2">
                            <button 
                                onClick={generateSketch}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#3E8BF3] hover:bg-[#1E66D6] rounded-md transition-colors disabled:bg-[#2A3040] disabled:cursor-wait"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                            {sketchData && (
                                <button 
                                    onClick={handleSaveSketch}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#2A3040] hover:bg-[#383f52] rounded-md transition-colors disabled:opacity-50"
                                >
                                    <Save size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
                 {error && <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
                
                 <div className="flex-1 overflow-y-auto pt-4 border-t border-[#2A3040]">
                    <h3 className="text-xs font-bold uppercase text-[#8A93A2] tracking-wider px-1 mb-2">My Sketches</h3>
                    {savedSketches.length === 0 ? (
                        <p className="text-xs text-center text-[#8A93A2] py-4">No saved sketches yet.</p>
                    ) : (
                        <ul className="space-y-1">
                            {savedSketches.map(sketch => (
                                <li key={sketch.name} className="bg-[#12161D] p-2 rounded-md flex items-center justify-between text-sm group">
                                    <span className="font-medium truncate pr-2">{sketch.name}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button onClick={() => handleLoadSketch(sketch.name)} title="Load" className="p-1 hover:bg-[#2A3040] rounded"><Download size={14}/></button>
                                        <button onClick={() => handleDeleteSketch(sketch.name)} title="Delete" className="p-1 hover:bg-red-500/20 text-red-400 rounded"><Trash2 size={14}/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
            <div className="flex-1 flex flex-col min-h-0">
                {!sketchData && !isLoading && (
                    <div className="flex-1 flex items-center justify-center text-center text-[#8A93A2] p-4">
                        <p>Your generated interactive sketch will appear here.</p>
                    </div>
                )}
                {isLoading && (
                    <div className="flex-1 flex items-center justify-center text-center text-[#8A93A2] p-4">
                         <Loader2 className="animate-spin mr-2" size={20} />
                         <span>AI is creating your masterpiece...</span>
                    </div>
                )}
                {sketchData && (
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_250px] min-h-0">
                        <div className="bg-black relative overflow-hidden">
                             <iframe
                                ref={iframeRef}
                                srcDoc={sketchHtml}
                                title="p5.js sketch"
                                sandbox="allow-scripts"
                                className="w-full h-full border-0"
                            />
                        </div>
                        <div className="bg-[#12161D] border-l border-[#2A3040] flex flex-col">
                            <div className="flex-shrink-0 flex border-b border-[#2A3040]">
                                 <button onClick={() => setActiveTab('controls')} className={`flex-1 flex items-center justify-center gap-2 p-2 text-xs ${activeTab === 'controls' ? 'bg-[#1A1F2A] text-white' : 'text-[#8A93A2]'}`}><SlidersHorizontal size={14}/> Controls</button>
                                 <button onClick={() => setActiveTab('code')} className={`flex-1 flex items-center justify-center gap-2 p-2 text-xs ${activeTab === 'code' ? 'bg-[#1A1F2A] text-white' : 'text-[#8A93A2]'}`}><Code size={14}/> Code</button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {activeTab === 'controls' && (
                                     <div className="p-3 space-y-4">
                                        {sketchData.controls_schema.map(control => (
                                            <SketchControl key={control.name} control={control} iframeRef={iframeRef} />
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'code' && (
                                     <Editor
                                        height="100%"
                                        language="javascript"
                                        value={sketchData.p5js_code}
                                        theme="vs-dark"
                                        options={{ readOnly: true, minimap: { enabled: false } }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageSketcher;