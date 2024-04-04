import React, { useState, useEffect } from 'react';
import './game.css';

function Game() {
  const [state, setState] = useState({
    word: '',
    guessedLetters: [],
    wrongLetters: [],
    language: 'fr-FR',
    gameWon: false,
    gameLost: false,
    difficulty: '',
  });

  useEffect(() => {
    if (state.language && state.difficulty) {
      fetchWord();
    }
  }, [state.language, state.difficulty]);

  useEffect(() => {
    checkGameStatus();
  }, [state.guessedLetters, state.wrongLetters]);

  const fetchWord = () => {
    fetch('https://node-hangman-api-production.up.railway.app/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ locale: state.language }),
    })
      .then(response => response.json())
      .then(data => {
        setState(prevState => ({
          ...prevState,
          word: data.word.toUpperCase(),
          guessedLetters: state.difficulty === 'facile' ? [data.word[0].toUpperCase()] : [],
          wrongLetters: [],
          gameWon: false,
          gameLost: false,
        }));
      })
      .catch(error => console.error('Fetch error:', error));
  };

  const normalizeLetter = (letter) => {
    if (state.difficulty === 'facile') {
      if (['E', 'É', 'È'].includes(letter.toUpperCase())) {
        return ['E', 'É', 'È'];
      }
    }
    return [letter.toUpperCase()];
  };

  const handleGuess = (e) => {
    e.preventDefault();
    let letter = e.target.elements.letter.value.toUpperCase();
    e.target.elements.letter.value = '';

    const lettersToCheck = normalizeLetter(letter);
    let guessed = false;

    lettersToCheck.forEach(lt => {
      if (state.word.includes(lt) && !state.guessedLetters.includes(lt)) {
        guessed = true;
        setState(prevState => ({
          ...prevState,
          guessedLetters: [...new Set([...prevState.guessedLetters, ...lettersToCheck])],
        }));
      }
    });

    if (!guessed && !state.wrongLetters.includes(letter)) {
      setState(prevState => ({
        ...prevState,
        wrongLetters: [...prevState.wrongLetters, letter],
      }));
    }
  };

  const handleLanguageChange = (e) => {
    setState(prevState => ({ ...prevState, language: e.target.value }));
  };

  const checkGameStatus = () => {
    const wordLetters = state.word.replace(/[- ]/g, '').split('');
    const allGuessed = wordLetters.every(letter => state.guessedLetters.includes(letter.toUpperCase()));
    if (state.word && allGuessed) {
      setState(prevState => ({ ...prevState, gameWon: true }));
    } else if (state.wrongLetters.length >= 11) {
      setState(prevState => ({ ...prevState, gameLost: true }));
    }
  };

  const displayWord = state.word.split('').map((letter, index) => {
    const isGuessed = state.guessedLetters.includes(letter.toUpperCase());
    return isGuessed || letter === '-' ? letter : '_';
  }).join(' ');

  const restartGame = () => {
    setState(prevState => ({ ...prevState, difficulty: '', gameWon: false, gameLost: false }));
  };

  if (!state.difficulty) {
    return (
      <div className='Pregame'>
        <h2>Choisissez une Difficulté</h2>
        <div>
          <button onClick={() => setState(prevState => ({ ...prevState, difficulty: 'facile' }))}>
            <h3>Facile</h3>
            <div>
                <p>- La première lettre du mot est donnée ainsi que ses pairs si elle apparaît plusieurs fois dans le mot.</p>
                <p>- e = é = è</p>
            </div>
          </button>
          <button onClick={() => setState(prevState => ({ ...prevState, difficulty: 'difficile' }))}>
            <h3>Difficile</h3>
            <div>
                <p>- Aucune lettre n'est donnée au début de la partie</p>
                <p>-e /= é /= è</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='Game'>
      <select onChange={handleLanguageChange} value={state.language}>
        <option value="fr-FR">Français - Cuisine</option>
        <option value="en-GB">Anglais - Mythologie</option>
      </select>

      <form onSubmit={handleGuess}>
        <input type='text' name='letter' maxLength='1' pattern="[A-Za-zÀ-ÖØ-öø-ÿ]" title="Une lettre uniquement" required />
        <button type='submit'>Deviner</button>
      </form>

      <p>{displayWord}</p>

      {state.wrongLetters.length > 0 && (
        <div className='wrongLetters'>
          Lettres fausses: {state.wrongLetters.join(', ')}
        </div>
      )}
      {state.gameWon && (
        <div className='winMessage'>
          <p>Bravo ! Vous avez trouvé le mot !</p>
          <button onClick={restartGame}>Rejouer</button>
        </div>
      )}
      {state.gameLost && (
        <div className='loseMessage'>
          <p>Dommage ! Vous avez perdu. Le mot était : {state.word}</p>
          <button onClick={restartGame}>Essayer à nouveau</button>
        </div>
      )}
    </div>
  );
}

export default Game;
