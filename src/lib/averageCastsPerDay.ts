// import supabase
// need to find a more efficient way to store this value
// maybe a statistics table and this gets calculated every 24hrs?

// const batchSize = 1000;
// let totalRecords = 0;
// let totalCasts = 0;
// let earliestDate = Date.now();

// (async () => {
//   let offset = 0;
//   while (true) {
//     const { data, error } = await supabase
//       .from('casts')
//       .select('published_at')
//       .range(offset, offset + batchSize - 1);

//     if (error) {
//       console.error(error);
//       return;
//     }

//     // Process the batch of records here...
//     console.log(`Retrieved ${data.length} records from offset ${offset}`);

//     for (const record of data) {
//       const publishedTime = new Date(record.published_at);
//       if (publishedTime < earliestDate) {
//         earliestDate = publishedTime;
//       }
//       totalCasts++;
//     }

//     totalRecords += data.length;
//     offset += batchSize;

//     // If we've reached the end of the table, exit the loop
//     if (data.length < batchSize) {
//       break;
//     }
//   }

//   console.log(`Retrieved a total of ${totalRecords} records`);

//   const totalTime = Date.now() - earliestDate.getTime();
//   const totalDays = totalTime / (1000 * 60 * 60 * 24);
//   const avgCastsPerDay = totalCasts / totalDays;

//   console.log(`Average number of casts per day: ${avgCastsPerDay}`);
// })();
