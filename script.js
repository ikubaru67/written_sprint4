document.addEventListener("DOMContentLoaded", () => {
  const pokemonList = document.getElementById("pokemon-list");
  const searchBar = document.getElementById("search-bar");
  let allPokemon = []; // Array to store all fetched Pokémon data

  // Function to fetch and display the initial 20 Pokémon
  const fetchInitialPokemon = async () => {
    for (let i = 1; i <= 20; i++) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const pokemon = await response.json();
        allPokemon.push(pokemon); // Store each Pokémon data
        displayPokemon(pokemon);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
      }
    }
  };

  // Function to fetch and store all Pokémon data for searching
  const fetchAllPokemon = async () => {
    try {
      let nextUrl = "https://pokeapi.co/api/v2/pokemon?limit=1000"; // Fetch up to 1000 Pokémon
      while (nextUrl) {
        const response = await fetch(nextUrl);
        const data = await response.json();
        const pokemonPromises = data.results.map(async (pokemon) => {
          const pokemonData = await fetch(pokemon.url);
          return pokemonData.json();
        });
        const pokemonArray = await Promise.all(pokemonPromises);
        allPokemon = [...allPokemon, ...pokemonArray]; // Combine with previously fetched data
        nextUrl = data.next; // Proceed to the next batch if available
      }
    } catch (error) {
      console.error("Error fetching all Pokémon data:", error);
    }
  };

  // Function to display a Pokémon card
  const displayPokemon = (pokemon) => {
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon-card");
    pokemonCard.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <div class="pokemon-name">${pokemon.name}</div>
            <button class="detail-button" onclick="toggleDetails(${
              pokemon.id
            })">Detail</button>
            <div class="pokemon-details" id="details-${pokemon.id}">
                <p><strong>Types:</strong> ${pokemon.types
                  .map((type) => type.type.name)
                  .join(", ")}</p>
                <p><strong>Base Stats:</strong></p>
                <ul>
                    ${pokemon.stats
                      .map(
                        (stat) =>
                          `<li>${stat.stat.name}: ${stat.base_stat}</li>`
                      )
                      .join("")}
                </ul>
            </div>
        `;
    pokemonList.appendChild(pokemonCard);
  };

  // Function to display Pokémon based on search query
  const displaySearchedPokemon = (query) => {
    pokemonList.innerHTML = ""; // Clear previous results
    const filteredPokemon = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().startsWith(query.toLowerCase())
    );
    if (filteredPokemon.length > 0) {
      filteredPokemon.forEach(displayPokemon);
    } else {
      pokemonList.innerHTML = `<p>No Pokémon found with that name.</p>`;
    }
  };

  // Function to toggle details visibility
  window.toggleDetails = (id) => {
    const detailsDiv = document.getElementById(`details-${id}`);
    if (
      detailsDiv.style.display === "none" ||
      detailsDiv.style.display === ""
    ) {
      detailsDiv.style.display = "block";
    } else {
      detailsDiv.style.display = "none";
    }
  };

  // Event listener for search bar input
  searchBar.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    if (query.length > 0) {
      displaySearchedPokemon(query);
    } else {
      pokemonList.innerHTML = ""; // Clear results if search bar is empty
      allPokemon.slice(0, 20).forEach(displayPokemon); // Re-display the initial 20 Pokémon
    }
  });

  // Fetch and display initial 20 Pokémon on page load
  fetchInitialPokemon();
  // Pre-fetch all Pokémon data for searching
  fetchAllPokemon();
});
