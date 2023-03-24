exports.handler = async (event, context) => {
  return {
    statusCode: 302,
    headers: { Location: 'https://lectures.london' },
  }
}
