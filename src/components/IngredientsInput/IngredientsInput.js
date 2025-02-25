"use client";
import { useState, useEffect } from "react";
import { toPng } from "html-to-image"; // Importa la función para convertir a imagen
import "./IngredientsInput.css";
import "./AIResponse.css";

const IngredientInput = () => {
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [difficulty, setDifficulty] = useState("media");
  const [mealType, setMealType] = useState("almuerzo");
  const [diet, setDiet] = useState("ninguna");
  const [portions, setPortions] = useState(2);
  const [showLoader, setShowLoader] = useState(false);
  const [showApplianceModal, setShowApplianceModal] = useState(false);
  const [selectedAppliances, setSelectedAppliances] = useState([
    "sartén", "horno", "microondas", "cocina de gas"
  ]);
  const [useStrictIngredients, setUseStrictIngredients] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setShowWarning(true);
    setWarningMessage(
      `⚠️ <strong>Aviso importante:</strong><br/><br/>
      Las recetas generadas en esta plataforma son creadas por una inteligencia artificial (IA) utilizando el modelo de OpenAI. 
      Aunque intentamos proporcionar recetas útiles y precisas, los resultados pueden contener errores, omisiones o ingredientes inadecuados.<br/><br/>
      ¡Disfruta cocinando con Comer-IA! 🍽️🤖`
    );
  }, []);

  const appliancesList = [
    "sartén", "horno", "microondas", "olla a presión", "barbacoa",
    "freidora de aire", "batidora", "cocina de gas", "cocina eléctrica",
  ];

  const handleAddIngredient = (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    if (input?.value) {
      setIngredients([...ingredients, input.value]);
      input.value = "";
    }
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const fetchRecipe = async () => {
    setErrorMessage("");
    setRecipe(null);
    setShowWarning(false);
    setShowLoader(true);

    const requestData = {
      ingredients,
      difficulty,
      mealType,
      diet,
      portions,
      appliances: selectedAppliances,
      useStrictIngredients
    };

    console.log("Datos enviados al backend:", requestData); // Verifica que los datos son correctos

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setShowWarning(true);
        setWarningMessage(errorText || "Error al generar la receta");
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.ok === false) {
        setShowWarning(true);
        setWarningMessage(data.warningmessage || "¡Receta no segura!");
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setRecipe(data);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setErrorMessage("Hubo un problema al generar la receta. Inténtalo de nuevo.");
    } finally {
      setShowLoader(false); // ✅ Desactiva el modal de carga cuando la petición finaliza
    }
  };

  const handleDownload = async () => {
    const recipeElement = document.getElementById("recipe-content");

    if (recipeElement) {
      try {
        // Función para excluir elementos de la imagen
        const filter = (node) => {
          return node.id !== "buttonRecipe";
        };

        const dataUrl = await toPng(recipeElement, { filter });

        // Crear un enlace temporal para descargar la imagen
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${recipe.title}.png`; // Nombre del archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error al generar la imagen:", error);
      }
    }
  };

  return (
    <div className="ingredient-input">
      {/* Botón para alternar la visibilidad de los filtros */}
      <button 
        className="ingredient-button  mg-top-20" 
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
      </button>

      {/* Selectores de filtros */}
      <div className={`filters-container ${showFilters ? "" : "collapsed"}`}>
        <div>
          <label className="difficulty-label">Dificultad:</label>
          <select className="difficulty-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="rápida">Rápida/Sencilla</option>
            <option value="media">Media</option>
            <option value="elavorada">Elaborada</option>
            <option value="difícil">Difícil</option>
          </select>
        </div>

        <div>
          <label className="meal-label">Tipo de comida:</label>
          <select className="meal-select" value={mealType} onChange={(e) => setMealType(e.target.value)}>
            <option value="desayuno">Desayuno</option>
            <option value="almuerzo">Almuerzo</option>
            <option value="cena">Cena</option>
            <option value="postre">Postre</option>
          </select>
        </div>

        <div>
          <label className="meal-label">Dieta:</label>
          <select className="diet-select" value={diet} onChange={(e) => setDiet(e.target.value)}>
            <option value="ninguna">Ninguna</option>
            <option value="vegana">Vegana</option>
            <option value="vegetariana">Vegetariana</option>
            <option value="baja en calorías">Baja en Calorías</option>
            <option value="sin gluten">Sin Gluten</option>
            <option value="alta en proteínas">Alta en Proteínas</option>
          </select>
        </div>

        <div>
          <label className="meal-label">Porciones:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={portions}
            onChange={(e) => setPortions(e.target.value)}
            className="portions-input"
          />
        </div>

        <button className="ingredient-button" onClick={() => setShowApplianceModal(true)}>
          Selecciona Electrodomésticos
        </button>
      </div>

      <div className="ingredients-container">
        <h3>Ingredientes:</h3>
        <form onSubmit={handleAddIngredient} className="ingredient-form">
          <input type="text" placeholder="Escribe un ingrediente" className="ingredient-field" />
          <button type="submit" className="ingredient-button">Añadir</button>
        </form>

        {/* Modal de ingredientes */}
        {ingredients.length > 0 && (
          <div className="ingredient-list-container">
            <label htmlFor="just-this-ingredients" className="checkboxLabel">Usar solo ingredientes seleccionados</label>
            <label className="checkboxLabel">
              <input
                type="checkbox"
                checked={useStrictIngredients}
                onChange={() => setUseStrictIngredients(!useStrictIngredients)}
              />
            </label>

            <ul className="ingredient-list">
              {ingredients.map((ingredient, index) => (
                <li key={index} onClick={() => handleRemoveIngredient(index)} className="ingredient-item">
                  {ingredient}
                </li>
              ))}
            </ul>
            <button onClick={() => setIngredients([])} className="ingredient-button-clear" title="Borrar ingredientes">Borrar todo</button>
          </div>
        )}
      </div>

      <button onClick={fetchRecipe} className="button-generate-recipe">Generar Receta</button>

      {/* Modal de Carga (Loader) ✅ */}
      {showLoader &&
        <div className="loader modal-overlay">
          <img src="/logogif.gif" alt="Cargando..." className="logogif" />
          <div className="loading-text">
            Generando Receta<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
          </div>
          <div className="loading-bar-background">
            <div className="loading-bar">
              <div className="white-bars-container">
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
              </div>
            </div>
          </div>
        </div>
      }

      {/* Modal de electrodomésticos */}
      {showApplianceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Selecciona los electrodomésticos disponibles:</h2>
            {appliancesList.map((appliance) => (
              <label key={appliance}>
                <input
                  type="checkbox"
                  checked={selectedAppliances.includes(appliance)}
                  onChange={() => setSelectedAppliances((prev) =>
                    prev.includes(appliance)
                      ? prev.filter((a) => a !== appliance)
                      : [...prev, appliance]
                  )}
                />
                {appliance}
              </label>
            ))}
            <button onClick={() => setShowApplianceModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal de Advertencia */}
      {showWarning && (
        <div className="modal-overlay">
          <div className="warning-modal">
            <img width="130px" src="/logoAlert.png" alt="Comer-IA" className="warning-logo" />
            <h2>¡¡Precaución!!</h2>
            <div className="warning-content">
              <p dangerouslySetInnerHTML={{ __html: warningMessage }} />
              <button onClick={() => setShowWarning(false)} className="ingredient-button">
                Entendido
              </button>
            </div>
            <div className="warning-footer">
              <h6>Este mensaje esta generado por IA y puede contener errores.</h6>
              <h6>Prueba a intentar generarla otra vez</h6>
            </div>
          </div>
        </div>
      )}

      {/* Modal Receta */}
      {recipe && (
        <div id="recipe-content" className="recipe-result">
          <div className="header-recipe">
            <img src='/logoComerIA.png' width='100px' alt="Comer-IA Logo"/>
          </div>
          <h2>{recipe.title}</h2>
          <h3>Ingredientes:</h3>
          <div className="pasos">
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </div>
          <h3>Pasos:</h3>
          <div className="pasos">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </div>
          {recipe.tips && <p className="recipe-tips">💡 {recipe.tips}</p>}
          <div id="buttonRecipe" className="flexBetween ">
            <button onClick={fetchRecipe} className="ingredient-button">🔄 Generar Otra Receta</button>
            <button onClick={handleDownload} className="ingredient-button">📥 Descargar Receta</button>
          </div>
          <div className="footer-recipe">
            <h6>Comer-IA puede cometer errores. Verifique la coherencia de la receta.</h6>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientInput;