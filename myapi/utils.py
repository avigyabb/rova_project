import time

def time_function(f):
    """
    A decorator that times the execution of the function it decorates and prints the duration.
    """
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        print(f"{f.__name__} executed in {end_time - start_time} seconds.")
        return result
    return wrapper