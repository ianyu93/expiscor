---
title: "Don't Like DSPy? Read This Before You Decide to Ditch It."
description: "Practical tips that overcome some common obstacles faced in deployment"
publishDate: 'Dec 05 2025'
seo:
  title: "Don't Like DSPy? Read This Before You Decide to Ditch It."
  description: "Practical tips that overcome some common obstacles faced in deployment"
---

<!-- mtoc-start -->

* [You're Not Stuck With DSPy Abstractions; You Most Definitely Can Prompt](#youre-not-stuck-with-dspy-abstractions-you-most-definitely-can-prompt)
  * [dspy.LM is Literally Your API ](#dspylm-is-literally-your-api-)
  * [Initialize Your Program with Instructions](#initialize-your-program-with-instructions)
* [Cost Tracking is Tricky, But You've Got All You Need](#cost-tracking-is-tricky-but-youve-got-all-you-need)
  * [Usage Tracking vs. Cost Tracking](#usage-tracking-vs-cost-tracking)
  * [Pitfalls When Logging Cost](#pitfalls-when-logging-cost)
* [DSPy's Abstraction Makes It Very Flexible](#dspys-abstraction-makes-it-very-flexible)
  * [Not Everything Has to Go Into LM Calls, How to Keep Identifier In Your Dict / Object](#not-everything-has-to-go-into-lm-calls-how-to-keep-identifier-in-your-dict--object)
  * [Fallback Strategy, Keep An Eye Out On This](#fallback-strategy-keep-an-eye-out-on-this)
  * [Modules Don't Have to Be LLM Calls, The World Is Your Oyster](#modules-dont-have-to-be-llm-calls-the-world-is-your-oyster)
* [Final Thoughts](#final-thoughts)

<!-- mtoc-end -->

First of all, this is not a 101 article, although I am still covering some basics. There are other blogs that cover "How to DSPy 101" much better and comprehensive. I'm just providing some common patterns to support them :) It's also important to note that here I focus on the Python version; DSPy also has ports to other languages such as TypeScript, Rust, etc. I do not know how they behave.

I've done a lot of "AI Engineer" implementations, as cheesy as that sounds, and so far, DSPy is my favourite when it comes to orchestration. I don't plan to get too deep into the weeds of why, because that's for another article, but what I found is while there are great interests in DSPy, there are common obstacles that I see newcomers face, and my goal for this article is to help remove some of those simple obstacles you may face, and can't easily find on documentation.

Some of the common obstacles include:
- "DSPy feels too high level / abstracted, so I don't have fine-grained control over prompts"
- "DSPy feels very anti-pattern and obscure"
- "How do I best format the prompts in docstrings?"
- "How do I switch to different models in DSPy? How do I track cost?"

There are more common questions and obstacles, so I hope that this article can help you overcome them.

## You're Not Stuck With DSPy Abstractions; You Most Definitely Can Prompt
DSPy encourages you to focus on programming not prompting, so most of the content is focused on how to define interfaces. When introduced to Signature, which really is about defining the input and output (a function signature), it is confusing if you're used to prompting. So when you see something like:

```
dspy.Signature("author: str, query: str -> answer: str")
```
You might come with two different feelings:
1. "OMG! This is so simple!" or;
2. "OMG! How do I control the behaviour?"

In DSPy way, it is encouraged to have tens of examples with metrics, and then let optimizers auto-optimize the prompt without ever touching it. This makes sense for many cases, especially if you know your ground truth, but it can also lead to two other obstacles:
- "I want a specific behaviour that is hard to be captured with examples"
- "I don't have a good way to get more examples or it's hard to descrbie the metrics"

While I would usually try to further decompose tasks, one thing you should understand is, you're not stuck at Signature level. In fact, for initialization, I personally encourage prompting.

### dspy.LM is Literally Your API 

Unless you're self-hosting models, the lowest level you're going for is probably just write direct prompts, sending messages in a list. You can do the same in dspy.

Your first example from homepage would be:
```
import dspy
lm = dspy.LM("openai/gpt-4o-mini", api_key="YOUR_OPENAI_API_KEY")
dspy.configure(lm=lm)

from typing import Literal

class Classify(dspy.Signature):
    """Classify sentiment of a given sentence."""

    sentence: str = dspy.InputField()
    sentiment: Literal["positive", "negative", "neutral"] = dspy.OutputField()
    confidence: float = dspy.OutputField()

classify = dspy.Predict(Classify)
classify(sentence="This book was super fun to read, though not the last chapter.")
```

But you can also just prompt the API directly:
```
response = lm(messages=[
    {"role": "system", "content": "Respond like a pirate"},
    {"role": "user", "content": "Tell me, what do you think of Ian Yu :)?"}
])
print(response)
```
I got:

```
 ["Arrr, matey! Ian Yu, ye say? If he be a swashbuckler or a landlubber, I can't say, for I be not familiar with the scallywag! But if he be a fine sailor or a clever knave, then I tip me tricorn hat to him! What’s the tale of this Ian Yu, eh? Spill the beans, or I might hoist ye overboard! Arrr! 🏴\u200d☠️"]
```

Fine, I'm not famous yet :) 

Anyways! If you really want to prompt with manually prompting with a list of messages, you are free to do so!

What you get from above is a list of text instead, that is because under the hood, lm object still would pass through **adapters**. Adaptors format the request and responses; DSPy's default adapter is ChatAdapters, but there are JSONAdapters, XML, and so on. You can also create your own custom adapter, have fine-grained control over how messages get formatted. For that, I recommend [Maxime Rivest](https://x.com/maximerivest)'s article, specifically this section about Making a [Simple Custom Adapter](https://maximerivest.com/posts/automatic-system-prompt-optimization.html#making-a-simple-custom-adapter). 

### Initialize Your Program with Instructions
There are going to be times where even if you decompose the tasks, you still would want some specific behaviours, so you prompt. Naturally, you found out that docstrings for your Signature is used for initial prompts, something like:

```
class SomeSignature(dspy.Signature):
    """
    Write some prompt here...
    """
    input: T = dspy.InputField(desc="")
    output: T = dspy.OutputField(desc="")
```

But that makes docstring a dual-purpose artifact. Docstrings should really stay as docstrings. Imagine you're reading through different functions and classes as you read through, and suddenly see "You are a professional cook" in what's supposed to be standardized format for everything in the codebase.

So, you should never write your prompt in the docstring. Instead, I write the following pattern:

```
predictor = dspy.Predict(SomeSignature.with_instructions("write your prompt here"))
if os.getenv("SOME_SIGNATURE_MODEL_URI"):
    predictor.load(os.getenv("SOME_SIGNATURE_MODEL_URI"))
```
This pattern is simple, but serves these purposes:
- You can still write your initial prompt if you'd like, especially for calls that are rather nuanced
- If you have optimized DSPy program in the future (if you're not sure how to save and load, see [Tutorial: Saving and Loading your DSPy program](https://dspy.ai/tutorials/saving/)), you can ensure to save the optimized program in your URI, and then you can just update/rollback your optimized prompt by updating your environment configuration. 
- This pattern also ensures that, if your system crashes and for somehow cannot access some URI, you have an initialization
    - You can further save your initialization prompt in a sqlite database or other places so that it's not hardcoded in the codebase
- This actually is the same pattern of loading model weights for typical ML models, so it's pretty natural to switch to non-LLMs in the future with similar patterns later on

## Cost Tracking is Tricky, But You've Got All You Need
I won't lie, it took me a while to understand what's going on, this part is most cared for in production, but it's not explained clearly in the documentation. That's ok, I'm here.

Cost tracking is an interesting thing. It's one of the biggest feature for LLM gateways, because it takes maintenance to keep pricing table from various providers up to date, especially when these providers also have provider specific cost (e.g. cached prompt cost). DSPy relies on LiteLLM, so it relies on LiteLLM to do the calculation. You can actually see LiteLLM community maintained pricing table [here](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json). This also means cost is actually an estimate, rather than precise measure. You won't deviate too far if you setup it up right.

### Usage Tracking vs. Cost Tracking
In order to get your cost, you would need to get it at LM level. You'd only get actual token usage if you use `get_lm_usage()` for results.

```
program = dspy.Predict(dspy.Signature("query:str -> answer: str"))
result = program(query="how are you today")
print(result.get_lm_usage())

```

Instead, you would get your cost as:

```
costs = [hist["cost"] for hist in lm.history]
```

Each object in history is the full result of each call in sequence, so you would get cost estimate for each call. But this is incomplete; because cost is calculated _after_ an LM call based on pricing table and token count, so you would still get cost even if your result is actually a cached call, so your code should really be:

```
costs = [hist["cost"] for hist in lm.history if hist["usage"]]
```

### Pitfalls When Logging Cost
There are two pitfalls I fell into when I was logging cost. 

First, I'd want to get cost by components, but by using the same LM object, I'd need additional parsing of `lm.history` to get what I need. Second, because cost is recorded at LM not by `dspy.Prediction` object, if you run asynchronous calls with the same LM object, and you may get duplicate history (if you run async calls for a list of tasks) or miss cost (if you have deeply nested module and high parallization, your history will quickly fill up the maximum records `lm.history` can hold, since different calls still fill the same `lm.history`).

So, the pattern that I've come to use is _always_ use context:

```
scope_specific_lm = dspy.LM(...)
with dspy.with_context(lm=scope_specific_lm):
    predictor.acall(...)
    logger.info([hist["cost"] for hist in scope_specific_lm.history if hist["usage"]])
```
By utilizing `with_context`, not only do I have fine-grained control on which models to call at every component, but cost is only scoped to that specific component. In my logging information, I can include some identifier that allows easy filter when I query from my log database. This also ensures that all the cost is logged. 

Specifics of the syntax would differ depending on your tracing and logging infrastructure, but the general idea is the same, ensure LM object is locally scoped for cost tracking.

## DSPy's Abstraction Makes It Very Flexible
I personally have the best time with DSPy because I can go as high-level or low-level as I want. I also recommend reading [The Data Quarry: DSPy Series](https://thedataquarry.com/blog/learning-dspy-1-the-power-of-good-abstractions/) by [Prashanth Rao](https://x.com/tech_optimist) for more in-depth discovery.

In this section, I just wanted to provide some miscellaneous thoughts.

### Not Everything Has to Go Into LM Calls, How to Keep Identifier In Your Dict / Object

One very common requirement is to track an object with some identifier or private attributes, this is so that you can pass the same dictionary or object throughout a pipeline, but it doesn't make sense to send these objects into LM calls. In such cases, the following pattern may help:

```
class QA(dspy.Signature):
    query: str = dspy.InputField(desc="question")
    answer: str = dspy.OutputField(desc="answer")

class QAModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.Predict(QA)

    def forward(self, session_id: int, query: str):
        result = self.predictor(query=query)
        return dspy.Prediction(
            session_id=session_id,
            answer=result.answer
        )
```

As you can see, you can pass an arbitrary number of things into a module, but you don't have to send everything into a signature. You can further extend this as an object:

```
class QA(dspy.Signature):
    query: str = dspy.InputField(desc="question")
    answer: str = dspy.OutputField(desc="answer")

class QAModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.Predict(QA)

    def forward(self, obj: SomeObject):
        result = self.predictor(query=obj.query)
        obj.answer = result.answer
        return dspy.Prediction(
            object=obj
        )
```

This pattern mostly matters when you need a clean way to pass an object through a pipeline module containing many calls.

### Fallback Strategy, Keep An Eye Out On This

This is one of the few rough edges that DSPy still needs to go through. Even though it's using LiteLLM under the hood, currently there's no built-in way to provide a list of configurations for fallback strategy, even though LiteLLM supports it, see [here](https://docs.litellm.ai/docs/proxy/reliability).

That said, there is a [PR](https://github.com/stanfordnlp/dspy/pull/8268) on this already, with people sharing their workarounds you can borrow.

### Modules Don't Have to Be LLM Calls, The World Is Your Oyster
This is perhaps my favourite reason when using DSPy, because as an engineer, our job is to pick the right tool at the right time. By reading through DSPy documentation, you might be thinking that DSPy Modules have to contain LLM calls, but that's not true. The following code works just fine:

```
class SomeModule(dspy.Module):
    def __init__(self):
        super().__init__()

    def forward(self, query: str):
        query = "[Test]" + query
        return dspy.Prediction(
            id=1,
            answer=query
        )

program = SomeModule()
result = program(query="where am I?")
print(type(result))
print(result)
```

You would still get this:
```
<class 'dspy.primitives.prediction.Prediction'>
Prediction(
    id=1,
    answer='[Test]where am I?'
)
```

You can have your modules to be anything. Therefore, when I design my modules, I focus on less on implementations, but more on **what interfaces and components make the most sense**.

For example, say that you have a large module containing three submodules to solve customer success tickets:
1. Classify ticket categories
2. Retrieve context for documentation
3. Generate response 

For your classification submodule that predicts categories, if you have enough data and categories do not change, you can replace dspy.LM calls with a [fasttext](https://fasttext.cc/) model without changing the interface. 

For your context retrieval, perhaps in your initial build, you have everything that fits within a small dictionary, and you can just use some rules to retrieve the right context. In this case, you don't require a database just yet until later stages, thus you can still design the same interface (input/output), but change the internal implementation to external system (e.g. vector databases) when you reach that point. Just because it's a module, doesn't mean you have to make it complicated.

Perhaps response generation you would continue to use an LM call, but you can see you'd have full flexibility on using the right tools at the right place with a consistent program.

## Final Thoughts
Hopefully this article helps you out on your initial obstacles, but at the same time, I understand if you decide it's still not right for you and give up on the framework. Sometimes it's just not right for your exact scenario. If you have any other thoughts, feel free to reach out to me on Twitter or on Discord :)
