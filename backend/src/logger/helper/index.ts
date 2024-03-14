const removeEscapeCharacters = (message: any) => {
  let value = message;
  if (message instanceof Error) {
    value = message.message + message.stack;
  }

  // stringify return undefined type when passed undefined, returning empty string instead
  const stringified = JSON.stringify(value) || "";

  return stringified.replace(/\\/g, "");
};

const formatLogMessages = (messages: any) => {
  let returnValue = "";

  for (let i = 0; i < messages.length; ++i) {
    const item = messages[i];
    returnValue += removeEscapeCharacters(item);
  }

  return returnValue;
};

export { formatLogMessages };
