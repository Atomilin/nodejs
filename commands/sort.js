const readline = require(`readline`);
const fs = require(`fs`);
const access = fs.access;
const path = require(`path`);

let state;
let rl;

const QUESTIONS = {
  DEFAULT: {
    TYPE: `question-default`,
    STRING: `Do sort files?(y/n)`
  },
  PATH_TO_SORT: {
    TYPE: `question-sort`,
    STRING: `Specify the path to the folder in which you want to sort files: `
  },
  PATH_TO_RESULT: {
    TYPE: `question-result`,
    STRING: `Specify the path to the folder where to put the result: `
  },
  DELETE: {
    TYPE: `question-delete`,
    STRING: `Delete the original folder?(y/n)`
  }
};

const ANSWER = {
  YES: `y`,
  NO: `n`
};

const ERROR = {
  PATH: `There is no such way!`,
  OTHER: `Incorrect answer!`
};

const INFO = {
  WAITING: `waiting...`,
  DELETE_DIR (name) {
    return `directory ${name} is deleted`;
  },
  DATA_SORT: `files to be sorted`
};

const reducer = async (question, answer) => {
  switch (question) {
    case QUESTIONS.DEFAULT.TYPE:
      switch (answer) {
        case ANSWER.YES:
          state = { ...state, question: QUESTIONS.PATH_TO_SORT };
          break;
        case ANSWER.NO:
          state = null;
          break;

        default:
          state = null;
          console.log(ERROR.OTHER);
      }
      nextStep();
      break;

    case QUESTIONS.PATH_TO_SORT.TYPE:
      state = { ...state, pathToSort: answer };
      console.log(INFO.WAITING);
      access(state.pathToSort, fs.constants.W_OK, (error) => {
        if (error) {
          state = null;
          console.log(ERROR.PATH);
        } else {
          state = { ...state, question: QUESTIONS.PATH_TO_RESULT };
        }
        nextStep();
      });
      break;

    case QUESTIONS.PATH_TO_RESULT.TYPE:
      state = { ...state, pathToResult: answer };
      console.log(INFO.WAITING);
      access(state.pathToResult, fs.constants.W_OK, (error) => {
        if (error) {
          state = null;
          console.log(ERROR.PATH);
        } else {
          state = { ...state, question: QUESTIONS.DELETE };
        }
        nextStep();
      });
      break;

    case QUESTIONS.DELETE.TYPE:
      const deleteFolder = answer === ANSWER.YES;
      state = { ...state, deleteFolder };
      console.log(INFO.WAITING);
      if (fs.existsSync(!state.pathToResult)) fs.mkdirSync(state.pathToResult);
      toSort(state.pathToSort);
      console.log(INFO.DATA_SORT);
      state = null;
      nextStep();
      break;
  }
};

const initialState = {
  question: QUESTIONS.DEFAULT,
  pathToSort: './sort',
  pathToResult: './newSort',
  deleteFolder: false
};

const nextStep = () => {
  if (state !== null) {
    rl.question(state.question.STRING, (answer) => {
      reducer(state.question.TYPE, answer);
    });
  } else {
    rl.close();
  }
};

const toSort = (pathToSort) => {
  const { pathToResult } = state;
  fs.readdirSync(pathToSort).forEach(function (name) {
    const filePath = path.join(pathToSort, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const file = path.parse(filePath);
      if (file.name.charAt(0) !== '.') {
        const resultPath = path.join(pathToResult, file.name.charAt(0));
        if (!fs.existsSync(resultPath)) fs.mkdirSync(resultPath);
        fs.copyFileSync(filePath, path.join(resultPath, file.name));
        console.log(`file: ${filePath} -- is copied`);
      }
      if (state.deleteFolder) fs.unlinkSync(filePath);
    } else if (stat.isDirectory()) {
      toSort(filePath);
    }
  });
  if (state.deleteFolder) {
    fs.rmdirSync(pathToSort);
    console.log(INFO.DELETE_DIR(pathToSort));
  }
};

module.exports = {
  description: `sorts files by name`,
  name: `--sort`,
  execute () {
    state = { ...initialState };

    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    nextStep();
  }
};