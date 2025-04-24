; GaiaScript X86-64 Runtime Support
; This file contains the runtime functions needed by GaiaScript assembly

section .data
    ; Error messages
    err_memory_alloc_failed db "Failed to allocate memory", 0
    
    ; Constants
    float_one dq 1.0
    
section .text
    global gaia_input_image
    global gaia_input_text
    global gaia_input_sequence
    global gaia_input_latent
    global gaia_conv_relu
    global gaia_conv_sigmoid
    global gaia_conv_tanh
    global gaia_conv_softmax
    global gaia_conv_none
    global gaia_dense_relu
    global gaia_dense_sigmoid
    global gaia_dense_tanh
    global gaia_dense_softmax
    global gaia_dense_none
    global gaia_pooling_none
    global gaia_flatten_none
    global gaia_loss_MSE
    global gaia_loss_BCE

; Input layer implementations
gaia_input_image:
    ; Allocate memory for image input
    ; Parameters:
    ;   r0 = width
    ;   r1 = height
    ;   r2 = channels
    push rbp
    mov rbp, rsp
    
    ; Calculate size needed (width * height * channels * sizeof(float))
    imul r0, r1
    imul r0, r2
    imul r0, 4  ; 4 bytes per float
    
    ; Allocate memory
    mov rdi, r0  ; Size
    call malloc
    
    ; Check if allocation succeeded
    test rax, rax
    jz .alloc_failed
    
    ; Initialize with zeros
    mov rdi, rax  ; Destination
    xor rsi, rsi  ; Value (0)
    mov rdx, r0   ; Size
    call memset
    
    ; Return pointer to allocated memory
    pop rbp
    ret
    
.alloc_failed:
    ; Print error message
    mov rdi, err_memory_alloc_failed
    call puts
    
    ; Return NULL
    xor rax, rax
    pop rbp
    ret

gaia_input_text:
    ; Similar to image input but for text
    ret

gaia_input_sequence:
    ; For sequence data
    ret

gaia_input_latent:
    ; For latent/random inputs
    ret

; Layer implementations
gaia_conv_relu:
    ; Convolutional layer with ReLU activation
    ; Parameters:
    ;   rdi = Input tensor
    ;   rsi = Filters
    ;   rdx = Other parameters
    ret

gaia_conv_sigmoid:
    ; Convolutional layer with sigmoid activation
    ret

gaia_conv_tanh:
    ; Convolutional layer with tanh activation
    ret

gaia_conv_softmax:
    ; Convolutional layer with softmax activation
    ret

gaia_conv_none:
    ; Convolutional layer without activation
    ret

gaia_dense_relu:
    ; Dense layer with ReLU activation
    ret

gaia_dense_sigmoid:
    ; Dense layer with sigmoid activation
    ret

gaia_dense_tanh:
    ; Dense layer with tanh activation
    ret

gaia_dense_softmax:
    ; Dense layer with softmax activation
    ret

gaia_dense_none:
    ; Dense layer without activation
    ret

gaia_pooling_none:
    ; Pooling layer
    ret

gaia_flatten_none:
    ; Flatten layer
    ret

; Loss functions
gaia_loss_MSE:
    ; Mean Squared Error loss function
    ret

gaia_loss_BCE:
    ; Binary Cross Entropy loss function
    ret

; External functions that would be linked in
extern malloc
extern free
extern memset
extern puts