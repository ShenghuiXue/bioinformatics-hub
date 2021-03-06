const fs = require("fs");
const BioinformaticsApp = require("./../../index");
const DataType = require("./../../src/constants/DataType");

// Below are three individule sequences extracted from fastaDNASequence1.txt manually.
const unnamedSequence1 = "TTTCCCAACAGGATCTCCCACCAGCCCAGCTTTTCTATATAGGCTCTGACCTCTGGTCATCCAAGTTGCAGGATGTCGATGACAGACTTGCTCAGCGCTGAGGACATCAAGAAGGCGATAGGAGCCTTTACTGCTGCAGACTCCTTCGACCACAAAAAGTTCTTCCAGATGGTGGGCCTGAAGAAAAAGAGTGCGGATGATGTGAAGAAGGTGTTCCACATTCTGGACAAAGACAAAAGTGGCTTCATTGAGGAGGATGAGCTGGGGTCCATTCTGAAGGGCTTCTCCTCAGATGCCAGAGACTTGTCTGCTAAGGAAACAAAGACGCTGATGGCTGCTGGAGACAAGGACGGGGACGGCAAGATTGGGGTTGAAGAATTCTCCACTCTGGTGGCCGAAAGCTAAGTGGCGCTGACTGCTTGGGTCTCCCACCTCTCCACCCCCCATGCCCCATCTCAGCCCTTCTCGCGGCCCTCCTGGGTTTCTGTTCAGTTTGTTTATGTTATTTTTTACTCCCCCATCCTTTATGGCCCTCGAATGACACCACTCTTCTGGAAAATGCTGGAGAAACAATAAAGGCTGTACCCATCGGACACCACCTGTAGGGAGGACCCAGGCCTGGTAGGTGTTGGTTTGGCAAGTTTTTCCGGACAGCAGTGGGGGTATAGTAGAAAAAGTGAGAGAGAGCGAAGGACCACGCCCTGATATTTCCTGCCTGCTTGGTACCGAGTGGTCACGTGGGCCACCTTGTTCAGTCTTTGTGCCTTTCCTACAAGGGGATGGGATGGCGCAGGGGATTTTAAAGATGCAGAAACTGCCTTTTAAAGAGCAGAACGGAAGGGGCTGAGTCCACAGGTGATTACTTTATGTCCCTGAGGAATAACTAGGTCGAAGGACTCAAATGACACTCTATCAATTGCTTTTGACTTTGCTGTGATAAAATTCCTGATAAGAGAAACTT";
const sampleSequence2 = "AAACTCCTCTTTGATTCTTCTAGCTGTTTCACTATTGGGCAACCAGACACCAGAATGAGTACTAAAAAGTCTCCTGAGGAACTGAAGAGGATTTTTGAAAAATATGCAGCCAAAGAAGGTGATCCAGACCAGTTGTCAAAGGATGAACTGAAGCTATTGATTCAGGCTGAATTCCCCAGTTTACTCAAAGGTCCAAACACCCTAGATGATCTCTTTCAAGAACTGGACAAGAATGGAGATGGAGAAGTTAGTTTTGAAGAATTCCAAGTATTAGTAAAAAAGATATCCCAGTGAAGGAGAAAACAAAATAGAACCCTGAGCACTGGAGGAAGAGCGCTGTGCTGTGGTCTTATCCTATGTGGAATCCCCCAAAGTCTCTGGTTTAATTCTTTGCAATTATAATAACCTGGCTGTGAGGTTCAGTTATTATTAATAAAGAAATTACTAGACATAC";
const unnamedSequence2 = "TTCGGCCGGC"; 

/**
 * Test {FastaSeq} contains the expected attributes initialized by {BioinformaticsApp}.
 */
test("test FastaSeq constructor and its attributes", () => {
  fs.readFile("./seeds/fastaDNASequence1.txt", (err, data) => {
    const fastaSequenceString = data.toString(); 
    const app = new BioinformaticsApp("dna");
    const fastaSeq = app.setFastaSequences(fastaSequenceString).getFastaSequenceObject();
    
    // assert data type
    expect(fastaSeq.dataType).toBe(DataType.DNA);
    // assert the orginal fasta sequence saved in the BioinformaticsApp 
    expect(fastaSeq.fastaSequencesString).toBe(fastaSequenceString);
    // assert that fastaSequenceObject in BioinformaticsApp contains the expected object
    expect(app.fastaSequenceObject).toBe(fastaSeq);
    // assert {SeqMap} inside of {FastaSeq}
    const seqMap = fastaSeq.seqMap;
    expect(seqMap.size).toBe(3);
    expect(seqMap.has("Unnamed sequence 1")).toBe(true);
    expect(seqMap.has("Sample sequence 2")).toBe(true);
    expect(seqMap.has("Unnamed sequence 2")).toBe(true);
    // assert the first sequence in the fasta file
    expect(seqMap.get("Unnamed sequence 1")["sequence"]).toBe(unnamedSequence1);
    expect(seqMap.get("Unnamed sequence 1")["sequenceId"]).toBe("Unnamed sequence 1");
    // assert the sequence in the fasta file
    expect(seqMap.get("Sample sequence 2")["sequence"]).toBe(sampleSequence2);
    expect(seqMap.get("Sample sequence 2")["sequenceId"]).toBe("Sample sequence 2");
    // assert the third sequence in the fasta file
    expect(seqMap.get("Unnamed sequence 2")["sequence"]).toBe(unnamedSequence2);
    expect(seqMap.get("Unnamed sequence 2")["sequenceId"]).toBe("Unnamed sequence 2");
  });
});

/**
 * Test methods in FastaSeq object.
 */
test("test methods in FastSeq if input FASTA string is not blank or empty", () => {
  fs.readFile("./seeds/fastaDNASequence1.txt", (err, data) => {
    const fastaSequenceString = data.toString(); 
    const app = new BioinformaticsApp("dna");
    const fastaSeqObj = app.setFastaSequences(fastaSequenceString).getFastaSequenceObject();
    const expectedSequenceIds = ["Unnamed sequence 1", "Sample sequence 2", "Unnamed sequence 2"];
    
    // assert that getAllsequenceId() method returns all sequence Ids.
    expect(fastaSeqObj.getAllSequenceIds().sort()).toEqual(expectedSequenceIds.sort());

    // assert that size() method returns 3.
    expect(fastaSeqObj.size()).toBe(3);

    // assert getSequenceById(id) method returns expected sequence.
    expect(fastaSeqObj.getSequenceById("Unnamed sequence 1")).toBe(unnamedSequence1);
    expect(fastaSeqObj.getSequenceById("Unnamed sequence 2")).toBe(unnamedSequence2);
    expect(fastaSeqObj.getSequenceById("Sample sequence 2")).toBe(sampleSequence2);
    expect(()=>{
      fastaSeqObj.getSequenceById("an invalid sequence id");
    }).toThrow("This sequence id is not valid. sequenceId = " + "an invalid sequence id");

    // assert getSequencesWithIds() method returns expected sequences using id as indeces. 
    const expectedSequencesByIdsObjected = {};
    expectedSequencesByIdsObjected["Unnamed sequence 1"] = unnamedSequence1;
    expectedSequencesByIdsObjected["Unnamed sequence 2"] = unnamedSequence2;
    expectedSequencesByIdsObjected["Sample sequence 2"] = sampleSequence2;
    expect(fastaSeqObj.getAllSequencesWithIds()).toEqual(expectedSequencesByIdsObjected);
  });
});

/**
 * Test unnamed FASTA sequence starting with >.
 */
test("test unnamed FASTA sequence and related methods", ()=>{
  const inputSequence = ">    \n ATATATA";
  const expectedSequenceId = "Unnamed sequence 1";
  const expectedSequenceAfterCleanUp = "ATATATA";
  const app = new BioinformaticsApp("DNA");
  app.setFastaSequences(inputSequence);
  expect(app.fastaSequenceObject.fastaSequencesString).toEqual(inputSequence);
  expect(app.fastaSequenceObject.getAllSequenceIds()).toEqual([expectedSequenceId]);
  expect(app.fastaSequenceObject.getSequenceById(expectedSequenceId)).toEqual(expectedSequenceAfterCleanUp);
  expect(app.fastaSequenceObject.size()).toEqual(1);
  expect(app.fastaSequenceObject.getAllSequencesWithIds()[expectedSequenceId]).toBe(expectedSequenceAfterCleanUp);
  expect(()=>{
    app.fastaSequenceObject.getSequenceById("ABCD");
  }).toThrow("This sequence id is not valid. sequenceId = ABCD");
});

/**
 * Test that the sequence do no contains any sequenceId.
 */
test ("Test that the sequence do no contains any sequenceId.", ()=>{
  const inputSeq = "DKDGNGY\r\nDKDKCTGAC";
  const expectedSequenceId = "Unnamed sequence 1";
  const expectedSequenceAfterCleanUp = "DKDGNGYDKDKCTGAC";
  const app = new BioinformaticsApp("protein");
  const fastaSeqObject = app.setFastaSequences(inputSeq).getFastaSequenceObject();
  expect(fastaSeqObject.getSequenceById(expectedSequenceId)).toBe(expectedSequenceAfterCleanUp);
});