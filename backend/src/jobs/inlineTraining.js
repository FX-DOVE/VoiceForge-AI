const { TrainingJob, VoiceClone } = require("../models");
const { completeTraining, TRAINING_STEPS } = require("../services/cloneService");

async function processInlineTraining({ trainingJobId, voiceCloneId }) {
  const trainingJob = await TrainingJob.findById(trainingJobId);
  const clone = await VoiceClone.findById(voiceCloneId);
  if (!trainingJob || !clone) return;

  trainingJob.status = "processing";
  trainingJob.startedAt = new Date();
  await trainingJob.save();

  for (let i = 0; i < TRAINING_STEPS.length; i++) {
    trainingJob.steps[i].status = "active";
    trainingJob.progress = Math.round(((i + 0.5) / TRAINING_STEPS.length) * 100);
    clone.progress = trainingJob.progress;
    await Promise.all([trainingJob.save(), clone.save()]);
    await new Promise((r) => setTimeout(r, 1500));
    trainingJob.steps[i].status = "done";
    trainingJob.progress = Math.round(((i + 1) / TRAINING_STEPS.length) * 100);
    clone.progress = trainingJob.progress;
    await Promise.all([trainingJob.save(), clone.save()]);
  }

  await completeTraining(voiceCloneId, trainingJobId);
}

module.exports = { processInlineTraining };
