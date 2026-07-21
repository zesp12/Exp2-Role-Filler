PennController.ResetPrefix(null);

const getUrlParameter = function (name) {
    const escapedName = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + escapedName + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(window.location.href);
    if (!results || !results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const subjectID = getUrlParameter("workerId") || "NO-SUBJ-ID";
const experimentName = "Exp2 ";
const imagePathPrefix = "";
const targKey = "f";
const nontargKey = "j";
const fixationDuration = 200;
const blankDuration = 100;
const imageDuration = 1100;
const responseDuration = 1000;
const trialsPerBlock = 96;
const targetRepeatsPerBlock = 4;

// ===================== TARGET SELECTION =====================

const objectPairs = ["06", "07", "08", "09", "11", "12", "13", "14", "15", "16", "21"];
 
function shuffle(arr) {
    let a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const shuffledPairs = shuffle(objectPairs);
const containmentTargetPair = shuffledPairs[0];
const supportTargetPair = shuffledPairs[1];
 
const target1ImageFile = containmentTargetPair + "_C.jpg";      // Block 1 target (Containment/IN)
const target2ImageFile = supportTargetPair + "_S-top.jpg";      // Block 2 target (Support/ON)
 
const excludedImages = new Set([
    containmentTargetPair + "_S-top.jpg", // Support version of the IN-target pair
    supportTargetPair + "_C.jpg"          // Containment version of the ON-target pair
]);

const demoImageFile = "22_filler.jpg";
const demoImagePath = imagePathPrefix + demoImageFile;

const nonTargetPool = [];
objectPairs.forEach(pair => {
    if (pair === containmentTargetPair || pair === supportTargetPair) return;
    nonTargetPool.push(pair + "_C.jpg");
    nonTargetPool.push(pair + "_S-top.jpg");
});

// ===================== TRIAL LIST BUILDER =====================
 
function buildBlockTrialList(targetImageFile, pool, totalTrials, targetRepeats) {
    const nonTargetSlots = totalTrials - targetRepeats;
 
    // Fill non-target slots with as-even-as-possible repeats of the pool.
    let fillers = [];
    while (fillers.length < nonTargetSlots) {
        fillers = fillers.concat(shuffle(pool));
    }
    fillers = fillers.slice(0, nonTargetSlots); 
 
    // Add the target image, repeated targetRepeats times.
    let list = fillers.concat(Array(targetRepeats).fill(targetImageFile));
 
    return shuffle(list);
}
 
const block1Images = buildBlockTrialList(target1ImageFile, nonTargetPool, trialsPerBlock, targetRepeatsPerBlock);
const block2Images = buildBlockTrialList(target2ImageFile, nonTargetPool, trialsPerBlock, targetRepeatsPerBlock);

// ===================== SEQUENCE =====================

Sequence(
    "intro", "language", "demographics", "instructionsFullScreen",
    "instructionsDemo", "instructionsReminder",
    "block1-intro", seq("block1-trial"),
    "block2-intro", seq("block2-trial"),
    "send", "end"
);

// ===================== STYLE =====================

function injectCommonStyle() {
    const style = document.createElement("style");
    style.textContent = "body { padding:0; margin:0; background-color:white; color:black; font-weight:300; font-size:13pt; }";
    document.head.appendChild(style);
}
injectCommonStyle();

// ===================== INTRO =====================

newTrial("intro",
    newText("introTitle", "Psychology Experiment").css("font-size","24pt").css("padding","10px").css("text-align","center").center().print(),
    newText("introText1", "The Brown Language & Thought Lab at Brown University is looking for online participants for a brief psychology experiment about visual perception. The only requirements are that you are at least 18 years old and are a native English speaker.").css("padding","5px").css("text-align","center").center().print(),
    newText("introText2", "By completing this survey or questionnaire, you are consenting to be in this research study. Your participation is voluntary and you can stop at any time.").css("padding","5px").css("text-align","center").center().print(),
    newText("introText3", "When you are ready, click Begin Experiment.").css("padding","5px").css("text-align","center").center().print(),
    fullscreen(),
    newButton("beginExperiment", "Begin Experiment").css("text-align","center").center().print().wait()
);

// ===================== LANGUAGE & DEMOGRAPHICS =====================

newTrial("language",
    newText("langTitle", "Language Questionnaire").css("font-size","24pt").print(),
    newText("langNativeLabel", "Are you a native speaker of English? In other words, you meet the following criteria: You learned English fluently from birth. You are a fluent speaker of English").print(),
    newDropDown("lang_native", "").add("", "Yes", "No").log().once().print(),
    newText("langMultilingualLabel", "Do you speak a language other than English?").print(),
    newDropDown("lang_multilingual", "").add("", "Yes", "No").log().once().print(),
    newText("langFirstLabel", "What was the first language you learned how to speak?").print(),
    newDropDown("lang_firstlang", "").add("", "English", "Not English").log().once().print(),
    newText("langUseLabel", "Currently, what language do you use most?").print(),
    newDropDown("lang_usemost", "").add("", "English", "Not English").log().once().print(),
    newText("langError", "Please answer all questions before continuing.")
        .color("red").css("margin-top","10px"),
    newButton("continueLanguage", "Continue")
        .css("margin-top","10px")
        .print()
        .wait(
            getDropDown("lang_native").test.selected("Yes").or(getDropDown("lang_native").test.selected("No"))
            .and(getDropDown("lang_multilingual").test.selected("Yes").or(getDropDown("lang_multilingual").test.selected("No")))
            .and(getDropDown("lang_firstlang").test.selected("English").or(getDropDown("lang_firstlang").test.selected("Not English")))
            .and(getDropDown("lang_usemost").test.selected("English").or(getDropDown("lang_usemost").test.selected("Not English")))
            .failure(getText("langError").print())
        ),
    newVar("subjectID", subjectID).log(),
    newVar("experimentName", experimentName).log()
);

newTrial("demographics",
    newText("demoTitle", "Demographics Section").css("font-size","24pt").print(),
    newText("demoInfo", "This is a voluntary demographic page. Completion of this page is completely up to you. Our funding agency and/or university ask that we obtain the following demographic information from each participant, so that they can monitor gender and minority inclusion in research studies.").css("padding","5px").print(),
    newText("demoGenderLabel", "Gender:").print(),
    newDropDown("demo_gender", "").add("", "Male", "Female", "Prefer not to say").log().once().print(),
    newText("demoEthnicLabel", "Ethnic category:").print(),
    newDropDown("demo_ethnic", "").add("", "Hispanic or Latino", "Not Hispanic or Latino", "Prefer not to say").log().once().print(),
    newText("demoRaceLabel", "Racial category:").print(),
    newDropDown("demo_race", "").add("", "American Indian / Alaskan Native", "Asian", "Black / African American", "Native Hawaiian / Pacific Islander", "White / Caucasian", "Prefer not to say", "Other").log().once().print(),
    newButton("continueDemographics", "Continue").css("margin-top","10px").print().wait(),
    newVar("subjectID", subjectID).log(),
    newVar("experimentName", experimentName).log()
);

// ===================== INSTRUCTIONS =====================

newTrial("instructionsFullScreen",
    newText("instrTitle", "Instructions").css("font-size","24pt").css("padding","10px").css("text-align","center").center().print(),
    newText("instrNote", "Before starting this study, your browser will be placed in full-screen mode. It is ideal that you perform the experiment in this mode. However, if you would like to exit full-screen mode, press the 'Escape' key. If this does not work, then on a Mac, you should press Control, Command, and F; or on Windows, press F11 at the top of your keyboard.").css("padding","5px").css("text-align","center").center().print(),
    newText("instrReminder", "Pressing 'Next' below will place your browser in 'full screen' mode.").css("padding","10px").css("text-align","center").css("font-style","italic").center().print(),
    newButton("blockNext", "Next").css("padding","5px").css("text-align","center").center().print().wait(),
    newFunction(() => {
        let el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }).call()
);

newTrial("instructionsDemo",
    newText("instruDemoTitle", "Instructions").css("font-size","24pt").css("padding","10px").css("text-align","center").center().print(),
    newText("instruDemoNote", "In this study, you will see sequences of photographs of various objects. Before each block (sequence), you will be presented with a 'target' image for that block, such as the below image:").css("padding","5px").css("text-align","center").center().print(),
    newImage("demoFirst", demoImageFile).size(500, 375).css("border","solid 1px black"),
    newImage("demoSecond", demoImagePath).size(500, 375).css("transform","scale(-1, 1)").css("border","solid 1px black"),
    newCanvas("demoTargets", 1100, 375)
        .add(25, 0, getImage("demoFirst"))
        .add(575, 0, getImage("demoSecond"))
        .center().print(),
    newText("instruDemoReminder", "As you can see, images will appear blocky or distorted, to make the task more challenging.").css("padding","10px").css("text-align","center").print(),
    newText("instruDemoReminder2", "Once the sequence starts, your job is to press the 'f' key if the image you see is the target image, and the 'j' key if not.").css("padding","5px").css("text-align","center").center().print(),
    newText("instruDemoNote2", "Note that the target image may appear as it does on the left, or mirror-flipped, as on the right. You should respond to the target in both cases!").css("font-weight","bold").css("padding","5px").css("text-align","center").center().print(),
    newButton("demoNext", "Next").css("padding","5px").css("text-align","center").center().print().wait()
);

newTrial("instructionsReminder",
    newText("instruReminderTitle", "Instructions").css("font-size","24pt").css("padding","10px").css("text-align","center").center().print(),
    newText("instruReminderNote", "Take your time and memorize the target image well! You will only get to see the target image at the beginning of the block. Once the sequence of images begins, you will have to rely on your memory to identify the target image!").css("padding","5px").css("font-weight","bold").css("text-align","center").center().print(),
    newText("instruReminderNote2", "This will be extra tricky because the target image for one sequence will be a non-target image in a different sequence later in the experiment.").css("padding","5px").css("text-align","center").center().print(),
    newText("instruReminderNote3", "After you have memorized the target image well, you'll click a button to begin the sequence.").css("padding","5px").css("text-align","center").center().print(),
    newButton("reminderNext", "Next").css("padding","5px").css("text-align","center").center().print().wait()
);

// ===================== BLOCK INTROS =====================
// trialsCompleted: 0 for block 1, trialsPerBlock for block 2

function makeBlockIntro(trialName, targetImageFile, trialsCompleted) {
    const targetImagePath = imagePathPrefix + targetImageFile;
    const totalTrials = trialsPerBlock * 2;
    const progressText = "Progress: " + trialsCompleted + " / " + totalTrials + " trials completed";
    newTrial(trialName,
        newText("blockTitle", "Block Instructions").css("font-size","24pt").css("padding","10px").css("text-align","center").center().print(),
        newText("blockProgress", progressText).css("font-size","13pt").css("color","#666").css("padding","5px").css("text-align","center").center().print(),
        newText("blockNote", "Here is the target image for this block. The image may appear mirror-flipped, and you should respond to the target in both cases.").css("padding","5px").css("text-align","center").center().print(),
        newImage("targetFirst", targetImagePath).size(500, 375).css("border","solid 1px black"),
        newImage("targetSecond", targetImagePath).size(500, 375).css("transform","scale(-1, 1)").css("border","solid 1px black"),
        newCanvas("blockTargets", 1100, 375)
            .add(25, 0, getImage("targetFirst"))
            .add(575, 0, getImage("targetSecond"))
            .center().print(),
        newText("blockReminder", "Take your time and memorize the target image well. Once the sequence begins, you will have to rely on your memory to identify the target image.").css("font-weight","bold").css("padding","10px").css("text-align","center").print(),
        newText("blockKeys", "Press 'f' if the image you see is the target image above, and 'j' if not.").css("font-weight","bold").css("padding","5px").css("text-align","center").center().print(),
        newText("blockSpeed", "You must respond within 1 second.").css("padding","5px").css("text-align","center").center().print(),
        newButton("beginBlock", "Begin Block").css("padding","5px").css("text-align","center").center().print().wait()
    );
}

makeBlockIntro("block1-intro", target1ImageFile, 0);
makeBlockIntro("block2-intro", target2ImageFile, trialsPerBlock);

// ===================== TRIAL BUILDER =====================

function makeTrial(trialLabel, imageName, targetImageFile, blockNum) {
    const imagePath = imagePathPrefix + imageName;
    const horizontalFlip = Math.random() >= 0.5 ? 1 : 0;
    const imageTransform = horizontalFlip === 1 ? "scale(1, 1)" : "scale(-1, 1)";
    const isTarget = imageName === targetImageFile;
    const correctKey = isTarget ? targKey : nontargKey;
    let onsetTime = 0;

    newTrial(trialLabel,
        newVar("subjectID", subjectID).log(),
        newVar("experimentName", experimentName).log(),
        newVar("block", blockNum).log(),
        newVar("imagePath", imagePath).log(),
        newVar("trialType", isTarget ? "Target" : "Non-Target").log(),
        newVar("targetImage", targetImageFile).log(),
        newVar("correctKey", correctKey).log(),
        newVar("horizontalFlip", horizontalFlip).log(),
        newVar("response", "NA").log(),
        newVar("RT", "NA").log(),
        newVar("RTinv", "NA").log(),
        newVar("timeout", 1).log(),
        newVar("accuracy", 0).log(),
        newVar("fixationDuration", fixationDuration).log(),
        newVar("blankDuration", blankDuration).log(),
        newVar("imageDuration", imageDuration).log(),

        newText("fixationText", "+").css("font-size","18pt"),
        newImage("trialImage", imagePath).size(742, 557).css("transform", imageTransform),

        newText("queryText", "Press 'f' for target, 'j' for others.").center().css("padding","20px").print(),

        newCanvas("trialCanvas", 800, 600)
            .color("#DDDDDD")
            .add(385, 260, getText("fixationText"))
            .center().print(),

        newTimer("fixationTimer", fixationDuration).start().wait(),

        newFunction("swapToImage", () => {
            let fix = document.querySelector("[data-element-id='fixationText']");
            if (fix) fix.style.display = "none";
        }).call(),

        newTimer("blankTimer", blankDuration).start().wait(),

        getCanvas("trialCanvas").add(29, 21, getImage("trialImage")),

        newFunction("recordOnset", () => { onsetTime = Date.now(); }).call(),

        newKey("response", "FJ")
            .log()
            .callback(
                getKey("response").disable(),
                getVar("timeout").set(0),
                newFunction("calcRT", () => {
                    let rt = Date.now() - onsetTime;
                    getVar("RT").set(rt);
                    getVar("RTinv").set(-1000 / rt);
                }).call(),
                getKey("response").test.pressed("f")
                    .success(getVar("response").set("f"))
                    .failure(getVar("response").set("j")),
                getKey("response").test.pressed(correctKey)
                    .success(
                        getVar("accuracy").set(1),
                        getImage("trialImage").css("outline","10px solid green")
                    )
                    .failure(
                        getVar("accuracy").set(0),
                        getImage("trialImage").css("outline","10px solid red")
                    )
            ),

        newTimer("responseTimer", responseDuration).start().wait(),
        getKey("response").disable(),

        getVar("timeout").test.is(1)
            .success(getImage("trialImage").css("outline","10px solid red")),

        newTimer("imageTimer", imageDuration - responseDuration).start().wait(),

        newFunction("hideImage", () => {
            let img = document.querySelector("[data-element-id='trialImage']");
            if (img) img.style.visibility = "hidden";
            if (img) img.style.outline = "";
        }).call()
    );
}

// ===================== BUILD ALL TRIALS =====================

block1Images.forEach(imageName => makeTrial("block1-trial", imageName, target1ImageFile, 1));
block2Images.forEach(imageName => makeTrial("block2-trial", imageName, target2ImageFile, 2));

// ===================== SEND / END =====================

newTrial("send",
    newText("sendText", "Submitting results...").print(),
    newTimer("sendTimer", 100).start().wait()
);

newTrial("end",
    newText("endText", "Done! You can now close this window. Thank you!").print()
);