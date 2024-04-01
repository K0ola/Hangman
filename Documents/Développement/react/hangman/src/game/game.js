import React, { useState, useEffect } from 'react';
import './game.css';

function Game() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [language, setLanguage] = useState('fr-FR');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    if (language && difficulty) {
      fetchWord(language);
    }
  }, [language, difficulty]);

  useEffect(() => {
    if (difficulty === 'facile' && word) {
      const firstLetter = word[0];
      setGuessedLetters(normalizeLetter(firstLetter));
    } else {
      setGuessedLetters([]);
    }
  }, [word, difficulty]);

  useEffect(() => {
    const wordLetters = word.replace(/[- ]/g, '').split('');
    const allGuessed = wordLetters.every(letter => guessedLetters.some(gl => normalizeLetter(letter).includes(gl)));
    if (word && allGuessed) {
      setGameWon(true);
    }
  }, [guessedLetters, word]);

  useEffect(() => {
    if (wrongLetters.length >= 11) {
      setGameLost(true);
    }
  }, [wrongLetters]);

  const fetchWord = (lang) => {
    const requestBody = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        locale: lang
      })
    };

    fetch('https://node-hangman-api-production.up.railway.app/', requestBody)
      .then(response => response.json())
      .then(data => {
        setWord(data.word.toUpperCase());
        setWrongLetters([]);
        setGameWon(false);
        setGameLost(false);
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  };

  const normalizeLetter = (letter) => {
    if (difficulty === 'facile') {
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
      if (word.includes(lt) && !guessedLetters.includes(lt)) {
        guessed = true;
        setGuessedLetters(prev => [...new Set([...prev, ...lettersToCheck])]);
      }
    });

    if (!guessed && !wrongLetters.includes(letter)) {
      setWrongLetters([...wrongLetters, letter]);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const displayWord = word.split('').map((letter, index) => {
    const isGuessed = guessedLetters.includes(letter) || (difficulty === 'facile' && index === 0);
    return isGuessed || letter === '-' ? letter : '_';
  }).join(' ');

  const restartGame = () => {
    setDifficulty('');
  };

  if (!difficulty) {
    return (
      <div className='Pregame'>
        <h2>Choisissez une Difficulté</h2>
        <div>
          <button onClick={() => setDifficulty('facile')}>
            <h3>Facile</h3>
            <div>
                <p>- La premiere lettre du mot est donnée ainsi que ses pairs si elle apparrait plusieurs fois dans le mot.</p>
                <p>- e = é = è</p>
            </div>
            
          </button>
          <button onClick={() => setDifficulty('difficile')}>
            <h3>Difficile</h3>
            <div>
                <p>- Aucune lettre n'est donnée au debut de la partie</p>
                <p>-e /= é /= è</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='Game'>
      <select onChange={handleLanguageChange} value={language}>
        <option value="fr-FR">Français - Cuisine</option>
        <option value="en-GB">Anglais - Mythologie</option>
      </select>

      <form onSubmit={handleGuess}>
      <input type='text' name='letter' maxLength='1' pattern="[A-Za-zÀ-ÖØ-öø-ÿ]" title="Une lettre uniquement" required />
      <button type='submit'>Deviner</button>
    </form>

      <p>{displayWord}</p>
      
      {wrongLetters.length > 0 && (
        <div className='wrongLetters'>
          Lettres fausses: {wrongLetters.join(', ')}
        </div>
      )}
      {gameWon && (
        <div className='winMessage'>
          <p>Bravo ! Vous avez trouvé le mot !</p>
          <button onClick={restartGame}>Rejouer</button>
        </div>
      )}
      {gameLost && (
        <div className='loseMessage'>
          <p>Dommage ! Vous avez perdu. Le mot était : {word}</p>
          <button onClick={restartGame}>Essayer à nouveau</button>
        </div>
      )}
    </div>
  );
}

export default Game;

