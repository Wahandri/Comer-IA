"use client";
import { useState, useEffect } from "react";
import { toPng } from "html-to-image"; // Opción 1: html-to-image
import html2canvas from "html2canvas"; // Opción 2: html2canvas
import "@/components/IngredientsInput/IngredientsInput.css";
import "@/components/IngredientsInput/AIResponse.css";

const RemediInput = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [remedy, setRemedy] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [remedyType, setRemedyType] = useState("herbal");
  const [duration, setDuration] = useState("corto");
  const [restrictions, setRestrictions] = useState("ninguna");
  const [showLoader, setShowLoader] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setShowWarning(true);
    setWarningMessage(
      `⚠️ <strong>Aviso importante:</strong><br/><br/>
      Los remedios sugeridos son recomendaciones generales y no sustituyen atención médica profesional.<br/>
      Consulta siempre con un especialista antes de usar cualquier remedio.<br/><br/>
      ¡Cuida tu salud con Remed-IA! 🌿🤖`
    );
  }, []);

  const handleAddSymptom = (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    if (input?.value) {
      setSymptoms([...symptoms, input.value]);
      input.value = "";
    }
  };

  const handleRemoveSymptom = (index) => {
    const newSymptoms = symptoms.filter((_, i) => i !== index);
    setSymptoms(newSymptoms);
  };

  const fetchRemedy = async () => {
    setErrorMessage("");
    setRemedy(null);
    setShowWarning(false);
    setShowLoader(true);

    const requestData = {
      symptoms,
      remedyType,
      duration,
      restrictions,
    };

    try {
      const response = await fetch("/api/remedies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setShowWarning(true);
        setWarningMessage(errorText || "Error al generar el remedio");
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.ok === false) {
        setShowWarning(true);
        setWarningMessage(data.warningmessage || "¡Remedio no seguro!");
        return;
      }

      setRemedy(data);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Hubo un problema al generar el remedio.");
    } finally {
      setShowLoader(false);
    }
  };

  const handleDownload = async () => {
    const remedyElement = document.getElementById("remedy-content");
    if (!remedyElement) {
      console.error("Elemento 'remedy-content' no encontrado.");
      return;
    }

    try {
      // Opción 1: Usar html-to-image
    //   const dataUrl = await toPng(remedyElement, {
    //     quality: 1, // Máxima calidad
    //     pixelRatio: 2, // Mejor resolución para dispositivos retina
    //   });

      // Opción 2: Usar html2canvas (comenta la opción 1 y descomenta esta)
      const canvas = await html2canvas(remedyElement);
      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${remedy.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al generar la imagen:", error);
    }
  };

  return (
    <>
        <h1>Remed-IA</h1>
        <div className="ingredient-input bg-remedia">
        <button
            className="ingredient-button mg-top-20"
            onClick={() => setShowFilters(!showFilters)}
        >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>

        <div className={`filters-container ${showFilters ? "" : "collapsed"}`}>
            <div>
            <label className="difficulty-label">Tipo de Remedio:</label>
            <select
                value={remedyType}
                onChange={(e) => setRemedyType(e.target.value)}
            >
                <option value="todos">Todos</option>
                <option value="crema">Crema/Pomada</option>
                <option value="infusion">Infusión</option>
                <option value="locion">Loción</option>
            </select>
            </div>

            <div>
            <label className="meal-label">Duración:</label>
            <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
            >
                <option value="corto">Corto plazo</option>
                <option value="medio">Mediano plazo</option>
                <option value="largo">Largo plazo</option>
            </select>
            </div>

            <div>
            <label className="meal-label">Restricciones:</label>
            <select
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
            >
                <option value="ninguna">Ninguna</option>
                <option value="embarazo">Embarazo</option>
                <option value="diabetes">Diabetes</option>
                <option value="presion-alta">Presión Alta</option>
            </select>
            </div>
        </div>

        <div className="ingredients-container">
            <h3>Síntomas:</h3>
            <form onSubmit={handleAddSymptom} className="ingredient-form">
            <input
                type="text"
                placeholder="Escribe un síntoma"
                className="ingredient-field"
            />
            <button type="submit" className="ingredient-button">
                Añadir
            </button>
            </form>

            {symptoms.length > 0 && (
            <div className="ingredient-list-container">
                <ul className="ingredient-list">
                {symptoms.map((symptom, index) => (
                    <li
                    key={index}
                    onClick={() => handleRemoveSymptom(index)}
                    className="ingredient-item"
                    >
                    {symptom}
                    </li>
                ))}
                </ul>
                <button
                onClick={() => setSymptoms([])}
                className="ingredient-button-clear"
                >
                Borrar todo
                </button>
            </div>
            )}
        </div>

        <button
            onClick={fetchRemedy}
            className="button-generate-recipe"
            disabled={symptoms.length === 0}
        >
            Generar Remedio
        </button>

        {showLoader && (
            <div className="loader modal-overlay">
            <img src="/images/logogif.gif" alt="Cargando..." className="logogif" />
            <div className="loading-text">
                Analizando síntomas<span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
            </div>
            </div>
        )}

        {showWarning && (
            <div className="modal-overlay">
            <div className="warning-modal">
                <img
                width="130px"
                src="/images/logoAlert.png"
                alt="Remed-IA"
                className="warning-logo"
                />
                <div className="warning-content">
                <p dangerouslySetInnerHTML={{ __html: warningMessage }} />
                <button
                    onClick={() => setShowWarning(false)}
                    className="ingredient-button"
                >
                    Entendido
                </button>
                </div>
            </div>
            </div>
        )}

        {remedy && (
            <div id="remedy-content" className="recipe-result">
            <div className="header-recipe">
                <img
                src="/logoRemedia.png"
                width="200px"
                alt="Remed-IA Logo"
                />
                <h2>Remed-IA</h2>
            </div>
            <h2>{remedy.title}</h2>
            <h3>Síntomas abordados:</h3>
            <div className="pasos">
                {remedy.symptoms.map((symptom, i) => (
                <li key={i}>{symptom}</li>
                ))}
            </div>
            <h3>Ingredientes:</h3>
            <div className="pasos">
                {remedy.ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li>
                ))}
            </div>
            <h3>Preparación:</h3>
            <div className="pasos">
                {remedy.preparation.map((step, i) => (
                <li key={i}>{step}</li>
                ))}
            </div>
            <h3>Aplicación:</h3>
            <div className="pasos">
                {remedy.application.map((step, i) => (
                <li key={i}>{step}</li>
                ))}
            </div>
            <h3>Descripción:</h3>
            <div className="pasos">
                <p>{remedy.description}</p>
            </div>
            {remedy.warnings && (
                <div className="recipe-tips warning-box">⚠️ {remedy.warnings}</div>
            )}
            <div id="buttonRecipe" className="flexBetween ">
                <button onClick={handleDownload} className="ingredient-button">
                📥 Descargar Remedio
                </button>
            </div>
            <div className="footer-recipe">
                <h6>
                Este remedio no sustituye atención médica profesional. Consulta a
                un especialista.
                </h6>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RemediInput;