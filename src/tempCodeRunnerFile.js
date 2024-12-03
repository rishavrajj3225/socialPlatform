(() => {
  try {
    // Connect to MongoDB without deprecated options
    mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Database connection successful!");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`App is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("ERROR: ", error);
    process.exit(1); // Exit the process with failure
  }
})();